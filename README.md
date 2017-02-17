# NodePKI

*NodePKI is a simple NodeJS based PKI manager for small corporate environments.*

---


## Implemented Features

* Auto-create a PKI with root CA and intermediate CA
* Request a new signed certificate via [nodepki-client](https://github.com/ThomasLeister/nodepki-client/)
* List available certificates
* Download issued certificate files
* Revoke issued certificate
* OSCP server
* CRL HTTP server


## Requirements

* Linux OS
* NodeJS
* NPM
* OpenSSL
* Bash Shell (?)


## Setup instructions

    git clone https://github.com/ThomasLeister/nodepki.git
    cd nodepki
    npm install  


### Configure NodePKI

There is an example config file "config.yml.default" which can be copied to "config.yml". Change config.yml to fit your environment. The passwords defined in config.yml will be used to create the PKI.

### Create OpenSSL X.509 PKI

    nodejs genpki.js


## API user login

### Add new user

    nodejs nodepkictl useradd --username user1 --password user1password

### Remove user

    nodejs nodepkictl userdel --username user1

## Start all the things!

Start your API server:


    nodejs server.js



## Request new certificate


* Create certificate key:

    openssl genrsa -aes256 -out certkey.pem 2048


* Create certificate request:

    openssl req -config mypki/openssl.cnf -key certkey.pem -new -sha256 -out cert.csr


* Use nodepki-client to submit the request:

    nodejs client.js request --csr cert.csr



## OCSP Query

Check certificate validity, e.G. via:

    openssl ocsp -url http://192.168.42.53:2560 -resp_text -CAfile ../../nodepki/mypki/intermediate/ca-chain.cert.pem -issuer ../../nodepki/mypki/intermediate/intermediate.cert.pem -cert cert.pem
