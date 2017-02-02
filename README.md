# NodePKI

*NodePKI is a simple NodeJS based PKI manager for small corporate environments.*

---


## Implemented Features

* Request a new signed certificate via certrequest.js client

## ToDo

* Temporäres Verzeichnis fit für parallele Anfragen machen
* Implement more API endpoints
* Feature: Revocation
* Tidy up code
* Tidy up .gitignore and files
* Fix external package versions.
* Feature: Authenticate users
* Finish Readme
* Check install instructions
* Build docker image

## Bugs

* Remvoe temporary files even if cert process fails



## Requirements

* NodeJS
* NPM
* OpenSSL


## Install instructions

```
git clone https://github.com/aditosoftware/nodepki.git
cd nodepki
npm install  
```

## Prerequisites

### Create a OpenSSL X.509 PKI

(in nodepki/mypki directory):

* Create CA key:
    ```openssl genrsa -aes256 -out private/ca.key.pem 4096```

* Create (self-signed) CA Certificate:
    ```openssl req -config openssl.cnf -key private/ca.key.pem -new -x509 -days 7300 -sha256 -extensions v3_ca -out certs/ca.cert.pem```


## Request new certificate

```cd ....```

* Create certificate key: ```openssl genrsa -aes256 -out private/ca.key.pem 2048```

* Create certificate request:
    ```openssl req -config intermediate/openssl.cnf -key intermediate/private/www.example.com.key.pem -new -sha256 -out intermediate/csr/www.example.com.csr.pem```

* Use certrequest.js to submit the request:
    ```nodejs certrequest.js request.csr```
