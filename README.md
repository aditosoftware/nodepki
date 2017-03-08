# NodePKI

*NodePKI is a simple NodeJS based PKI manager for small corporate environments.*

---


## Implemented Features

* Auto-create a PKI with root CA and intermediate CA
* Request new certificates
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

## Run NodePKI with Docker

**The recommended way to run NodePKI is to make use of the NodePKI Docker image.** Find more information here: [NodePKI Docker image](https://github.com/aditosoftware/nodepki-docker/)


## Setup instructions

    git clone https://github.com/aditosoftware/nodepki.git
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


## API usage

For information on how to use the API, read [API.md](/API.md)


## Using the server via client

Use [nodepki-client](https://github.com/aditosoftware/nodepki-client/) to request certificates and manage your PKI. If you prefer using a GUI, consider using [nodepki-webclient](https://github.com/aditosoftware/nodepki-webclient/).
