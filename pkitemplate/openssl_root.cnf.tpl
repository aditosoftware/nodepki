[ca]

default_ca = CA_default

[ CA_default ]
# Directory and file locations.
dir               = {basedir}
certs             = $dir/certs
crl_dir           = $dir/crl
new_certs_dir     = $certs
database          = $dir/index.txt
serial            = $dir/serial
RANDFILE          = $dir/.rand

# The root key and root certificate.
private_key       = $dir/root.key.pem
certificate       = $dir/root.cert.pem

# For certificate revocation lists.
crlnumber         = $dir/crlnumber
crl               = $dir/crl/root.crl.pem
crl_extensions    = crl_ext
default_crl_days  = 7

# SHA-1 is deprecated, so use SHA-2 instead.
default_md        = sha256

name_opt          = ca_default
cert_opt          = ca_default
default_days      = {days}
preserve          = no
policy            = policy_strict


[ policy_strict ]
countryName             = match
stateOrProvinceName     = match
localityName            = optional
organizationName        = match
organizationalUnitName  = optional
commonName              = supplied
emailAddress            = optional



[ req ]
default_bits        = 2048
distinguished_name  = req_distinguished_name
string_mask         = utf8only
default_md          = sha256

# Extension to add when the -x509 option is used.
x509_extensions     = v3_ca

prompt = no


[ req_distinguished_name ]
C={country}
ST={state}
L={locality}
O={organization}
CN={commonname}


###
### Extensions
###

### For CA
[ v3_ca ]
subjectKeyIdentifier = hash
authorityKeyIdentifier = keyid:always,issuer
basicConstraints = critical, CA:true
keyUsage = critical, digitalSignature, cRLSign, keyCertSign

### For Intermediate CA
[ v3_intermediate_ca ]
subjectKeyIdentifier = hash
authorityKeyIdentifier = keyid:always,issuer
basicConstraints = critical, CA:true, pathlen:0
keyUsage = critical, digitalSignature, cRLSign, keyCertSign


### For server certificates (API Cert)
[ server_cert ]
basicConstraints = CA:FALSE
nsCertType = server
nsComment = "OpenSSL Generated Server Certificate"
subjectKeyIdentifier = hash
authorityKeyIdentifier = keyid,issuer:always
keyUsage = critical, digitalSignature, keyEncipherment
extendedKeyUsage = serverAuth


### For CRLs
[ crl_ext ]
authorityKeyIdentifier=keyid:always


### For OCSP certificates
[ ocsp ]
basicConstraints = CA:FALSE
subjectKeyIdentifier = hash
authorityKeyIdentifier = keyid,issuer
keyUsage = critical, digitalSignature
extendedKeyUsage = critical, OCSPSigning
