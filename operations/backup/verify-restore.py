#!/usr/bin/env python3
"""Restore newest SMA Hope backup into a uniquely named temporary schema; never overwrite smahope."""
import gzip,hashlib,re,secrets,subprocess
from pathlib import Path
mysql=['mysql','--defaults-file=/etc/mysql/debian.cnf','--batch','--skip-column-names']
def sql(statement):return subprocess.check_output(mysql+['-e',statement])
backup=sorted(Path('/var/backups/smahope').glob('smahope-*.sql.gz.enc'))[-1]
expected=Path(str(backup)+'.sha256').read_text().split()[0]
assert hashlib.sha256(backup.read_bytes()).hexdigest()==expected,'Backup checksum mismatch'
compressed=subprocess.check_output(['openssl','enc','-d','-aes-256-cbc','-pbkdf2','-iter','200000','-pass','file:/etc/smahope-backup/encryption-key','-in',str(backup)])
dump=gzip.decompress(compressed)
assert not re.search(rb'^(CREATE DATABASE|USE )',dump,re.M),'Unexpected database-switch directive'
name='smahope_restore_'+secrets.token_hex(8)
charset,collation=sql("SELECT DEFAULT_CHARACTER_SET_NAME,DEFAULT_COLLATION_NAME FROM information_schema.SCHEMATA WHERE SCHEMA_NAME='smahope'").decode().strip().split('\t')
assert re.fullmatch('[a-zA-Z0-9_]+',charset) and re.fullmatch('[a-zA-Z0-9_]+',collation)
created=False
try:
 sql(f'CREATE DATABASE `{name}` CHARACTER SET {charset} COLLATE {collation}')
 created=True
 subprocess.run(mysql+[name],input=dump,stdout=subprocess.DEVNULL,stderr=subprocess.PIPE,check=True)
 result=subprocess.check_output(['mysqldump','--defaults-file=/etc/mysql/debian.cnf','--single-transaction','--quick','--skip-lock-tables','--no-tablespaces','--set-gtid-purged=OFF','--hex-blob','--routines','--events','--triggers',name],stderr=subprocess.PIPE)
 def normalized(data):
  lines=[]
  for line in data.splitlines():
   if not line.strip() or line.startswith(b'--'):continue
   # MySQL can render the charset explicitly after a restore. The matching
   # utf8mb4 collation already determines that charset; do not alter data lines.
   if line.startswith(b'  `'):
    line=line.replace(b' CHARACTER SET utf8mb4 COLLATE utf8mb4_',b' COLLATE utf8mb4_')
   lines.append(line)
  return b'\n'.join(lines)
 assert normalized(dump)==normalized(result),'Restored SQL differs from backed-up SQL'
 columns="SELECT TABLE_NAME,COLUMN_NAME,COLUMN_TYPE,IS_NULLABLE,COALESCE(COLUMN_DEFAULT,'<NULL>'),COALESCE(CHARACTER_SET_NAME,''),COALESCE(COLLATION_NAME,'') FROM information_schema.COLUMNS WHERE TABLE_SCHEMA='{}' ORDER BY TABLE_NAME,ORDINAL_POSITION"
 assert sql(columns.format('smahope'))==sql(columns.format(name)),'Restored column metadata differs'
 count=int(sql(f"SELECT COUNT(*) FROM information_schema.TABLES WHERE TABLE_SCHEMA='{name}'"))
 assert count>=17,'Expected foundation tables missing'
 print(f'PASS: checksum, decryption, SQL restore and exact normalized re-export comparison; {count} tables restored.')
 Path('/var/backups/smahope/last-restore-success').touch()
finally:
 if created:
  assert name.startswith('smahope_restore_') and re.fullmatch('smahope_restore_[a-f0-9]{16}',name)
  sql(f'DROP DATABASE `{name}`')
  print('Temporary restore schema removed; live SMA Hope database unchanged.')
