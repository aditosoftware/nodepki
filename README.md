# NodePKI

*NodePKI is a simple NodeJS based PKI manager for small corporate environments.*

---


## Implemented Features

* Auto-create a PKI via Bash script
* Request a new signed certificate via nodepki-client
* List available certificates
* Download issued certificate files (without key!)
* Revoke issued certificate
* OSCP server



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


### Configure NodePKI

There is an example config file "config.yml.default" which can be copied to "config.yml". Change config.yml to fit your environment.

### Create OpenSSL X.509 PKI

```
./mypki/genpki.sh
```

## Start all the things!

Start your API server:

```
nodejs server.js
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
nodejs client.js request --csr cert.csr
```


## OCSP Query

Check certificate validity, e.G. via:
```
openssl ocsp -url http://192.168.42.53:2560 -resp_text -CAfile ../nodepki/mypki/certs/ca.cert.pem -issuer ../nodepki/mypki/certs/ca.cert.pem -cert cert.pem
```
