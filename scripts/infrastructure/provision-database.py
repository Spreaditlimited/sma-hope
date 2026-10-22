"""Provision only smahope and its restricted runtime user on the owner-authorised VPS."""
import json,subprocess,secrets,os
from pathlib import Path
folder=Path('.local');folder.mkdir(exist_ok=True);folder.chmod(0o700)
credential=folder/'database.json'
if credential.exists(): config=json.loads(credential.read_text())
else:
 config={'password':'Sma!'+secrets.token_hex(32)}
 fd=os.open(credential,os.O_WRONLY|os.O_CREAT|os.O_EXCL,0o600)
 with os.fdopen(fd,'w') as f:json.dump(config,f)
sql=Path('database/001-initial.sql').read_text()
remote=r'''
import subprocess,json
cfg=CONFIG
base=['mysql','--defaults-file=/etc/mysql/debian.cnf','--batch','--skip-column-names']
def query(q):
 r=subprocess.run(base+['-e',q],stdout=subprocess.PIPE,stderr=subprocess.PIPE)
 if r.returncode:
  print(r.stderr.decode().replace(cfg['password'],'[REDACTED]'));raise RuntimeError('Database command failed')
 return r.stdout.decode().strip()
exists=query("SELECT COUNT(*) FROM information_schema.SCHEMATA WHERE SCHEMA_NAME='smahope'")
if exists!='0':
 tables=query("SELECT TABLE_NAME FROM information_schema.tables WHERE table_schema='smahope'").splitlines()
 assert len(tables)==17, 'Unexpected existing schema; stop'
 for table in tables: assert query('SELECT COUNT(*) FROM smahope.`'+table+'`')=='0'
else:
 query("CREATE DATABASE smahope CHARACTER SET utf8mb4 COLLATE utf8mb4_bin")
r=subprocess.run(base+['smahope'],input=cfg['sql'].encode(),stdout=subprocess.PIPE,stderr=subprocess.PIPE)
if r.returncode:
 print(r.stderr.decode());raise RuntimeError('Schema installation failed; inspect before retry.')
query("CREATE USER 'smahope_app'@'%' IDENTIFIED BY '"+cfg['password']+"' REQUIRE SSL WITH MAX_USER_CONNECTIONS 12")
query("GRANT SELECT,INSERT,UPDATE,DELETE ON smahope.* TO 'smahope_app'@'%'")
print('Created smahope database and TLS-required, data-only smahope_app identity.')
print('Tables: '+query("SELECT COUNT(*) FROM information_schema.tables WHERE table_schema='smahope'"))
'''.replace('CONFIG',repr({'password':config['password'],'sql':sql}),1)
r=subprocess.run(['ssh','-i','/Users/tochukwunkwocha/projects/effikos/.vercel/hostinger/effikos_admin','-o','IdentitiesOnly=yes','-o','BatchMode=yes','-o','StrictHostKeyChecking=yes','root@195.35.29.41','python3 -'],input=remote.encode(),stdout=subprocess.PIPE,stderr=subprocess.PIPE)
print(r.stdout.decode())
if r.returncode:
 print('Provisioning failed: '+r.stderr.decode().replace(config['password'],'[REDACTED]')[-1200:]);raise SystemExit(1)
p=Path('.env.local');s=p.read_text()
if 'SMAHOPE_DATABASE_URL=' not in s:
 s+='\nSMAHOPE_DATABASE_URL="mysql://smahope_app:'+config['password']+'@195.35.29.41:3308/smahope"\nSMAHOPE_AUTH_SECRET="'+secrets.token_hex(32)+'"\nSMAHOPE_ADMIN_AUTH_SECRET="'+secrets.token_hex(32)+'"\nSMAHOPE_AUTH_URL="http://localhost:3002"\n'
 p.write_text(s);p.chmod(0o600)
print('Saved independent SMA Hope runtime credentials locally. No credentials printed.')
