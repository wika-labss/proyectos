import forge from 'node-forge';

export interface PemCertificate {
  key: string;
  cert: string;
}

/** Genera certificado cliente RSA para Android TV Remote Protocol v2. */
export function generateClientCertificate(commonName = 'Vissiuss Remote'): PemCertificate {
  const keys = forge.pki.rsa.generateKeyPair(2048);
  const cert = forge.pki.createCertificate();
  cert.publicKey = keys.publicKey;
  const serialBytes = forge.random.getBytesSync(19);
  cert.serialNumber = `01${forge.util.bytesToHex(serialBytes)}`;
  cert.validity.notBefore = new Date();
  const notAfter = new Date();
  notAfter.setUTCFullYear(2099);
  cert.validity.notAfter = notAfter;

  const attributes = [
    { name: 'commonName', value: commonName },
    { name: 'countryName', value: 'US' },
    { shortName: 'ST', value: 'CA' },
    { name: 'localityName', value: 'Local' },
    { name: 'organizationName', value: 'Vissiuss' },
    { shortName: 'OU', value: 'Remote' },
  ];
  cert.setSubject(attributes);
  cert.setIssuer(attributes);
  cert.sign(keys.privateKey, forge.md.sha256.create());

  return {
    cert: forge.pki.certificateToPem(cert),
    key: forge.pki.privateKeyToPem(keys.privateKey),
  };
}
