# NodePKI

*NodePKI is a simple NodeJS based PKI manager for small corporate environments.*

---


## Implemented Features

* Auto-create a PKI
* Request a new signed certificate via certrequest.js client
* List available certificates
* Download issued certificate files (without key!)



## Requirements

* NodeJS
* NPM
* OpenSSL
* Bash Shell


## Setup instructions

```
git clone https://github.com/ThomasLeister/nodepki.git
cd nodepki
npm install  
```

## Prerequisites

### Create OpenSSL X.509 PKI

```
./mypki/genpki.sh
```

## Configure NodePKI

Set IP and Port to your needs and provide the CA passphrase you entered before.

```
server:
    ip: 192.168.42.53
    port: 8081

ca:
    passphrase: MyIncrediblyLongAndRandomCAPassphrase
```

## Start all the things!

Start your API server:

```
nodejs app.js
```



## Request new certificate


* Create certificate key:
```
openssl genrsa -aes256 -out certkey.pem 2048
```

* Create certificate request:
```
openssl req -config mypki/openssl.cnf -key certkey.pem -new -sha256 -out cert.csr
```

* Use nodepki-client to submit the request:
```
nodepki-client request --csr cert.csr
```
