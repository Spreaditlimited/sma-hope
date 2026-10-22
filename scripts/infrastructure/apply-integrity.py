import subprocess,hashlib
from pathlib import Path
sql=Path('database/002-integrity.sql').read_text();checksum=hashlib.sha256(sql.encode()).hexdigest()
remote=r'''
import subprocess,hashlib
sql=SQL
assert hashlib.sha256(sql.encode()).hexdigest()==CHECKSUM
base=['mysql','--defaults-file=/etc/mysql/debian.cnf','--batch','--skip-column-names','smahope']
def query(q):return subprocess.check_output(base+['-e',q],stderr=subprocess.PIPE).decode().strip()
existing=query("SELECT COUNT(*) FROM information_schema.REFERENTIAL_CONSTRAINTS WHERE CONSTRAINT_SCHEMA='smahope' AND CONSTRAINT_NAME='donor_auth_fk'")
assert existing=='0','Integrity migration already started; inspect before replay'
subprocess.run(['/usr/local/sbin/smahope-backup'],check=True)
r=subprocess.run(base,input=sql.encode(),stdout=subprocess.PIPE,stderr=subprocess.PIPE)
if r.returncode:print(r.stderr.decode());raise RuntimeError('Integrity migration failed')
assert query("SELECT COUNT(*) FROM information_schema.REFERENTIAL_CONSTRAINTS WHERE CONSTRAINT_SCHEMA='smahope'")=='9'
print('PASS: ownership foreign keys and history indexes installed; source records preserved.')
'''.replace('SQL',repr(sql),1).replace('CHECKSUM',repr(checksum),1)
r=subprocess.run(['ssh','-i','/Users/tochukwunkwocha/projects/effikos/.vercel/hostinger/effikos_admin','-o','IdentitiesOnly=yes','-o','BatchMode=yes','-o','StrictHostKeyChecking=yes','root@195.35.29.41','python3 -'],input=remote.encode(),stdout=subprocess.PIPE,stderr=subprocess.PIPE)
print(r.stdout.decode());print(r.stderr.decode()[-500:] if r.returncode else '');raise SystemExit(r.returncode)
