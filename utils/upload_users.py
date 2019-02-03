import random
import string

import requests
from requests.auth import HTTPBasicAuth

client = requests.Session()

URL = 'http://localhost:8080/alfresco/s/api/people'
# URL = 'http://alfresco.example.org:8080/alfresco/s/api/people'
N_USERS = 1500
#GROUP = 'JMeter'
GROUP = 'swsdp'

with open('data/names.txt', 'r') as fp:
    lines = fp.readlines()

users = [
    (''.join(random.choice(string.ascii_lowercase) for _ in range(5)), 'lastname') for i in range(N_USERS)
]

#users = []
#for line in lines:
#    s = line.split()
#    users.append((s[0], s[1]))
#

def upload_user(user: tuple):
    payload = {
        'userName': user[0].lower(),
        'firstName': user[0],
        'lastName': user[1],
        'email': user[0].lower() + '@alfresco.example.org',
        'password': user[0].lower(),
	'groups': ['GROUP_site_' + GROUP + '_SiteCollaborator'] if GROUP else []
    }
    r = client.post(URL, json=payload, auth=HTTPBasicAuth('admin', 'admin'))
    return r


def delete_user(user: tuple):
    r = client.delete('{}/{}'.format(URL, user[0].lower()),
                      auth=HTTPBasicAuth('admin', 'admin'))

users_created = []
counter = 0
for user in users:
    r = upload_user(user)
    # r = delete_user(user)
    print(r)
    if r.ok:
        users_created.append(user)
        print(r)
#    if len(users_created) == N_USERS:
#        break
    counter += 1
    if counter % 100 == 0:
        print(counter)

with open('data/users.csv', 'w') as fp:
    for user in users_created:
        fp.write(user[0].lower() + '\n')
