import protobuf from 'protobufjs';

const PAIRING_PROTO = `
syntax = "proto3";
package pairing;

enum RoleType {
  ROLE_TYPE_UNKNOWN = 0;
  ROLE_TYPE_INPUT = 1;
  ROLE_TYPE_OUTPUT = 2;
}

message PairingRequest {
  string service_name = 1;
  string client_name = 2;
}

message PairingRequestAck {
  string server_name = 1;
}

message PairingEncoding {
  enum EncodingType {
    ENCODING_TYPE_UNKNOWN = 0;
    ENCODING_TYPE_ALPHANUMERIC = 1;
    ENCODING_TYPE_NUMERIC = 2;
    ENCODING_TYPE_HEXADECIMAL = 3;
    ENCODING_TYPE_QRCODE = 4;
  }
  EncodingType type = 1;
  uint32 symbol_length = 2;
}

message PairingOption {
  repeated PairingEncoding input_encodings = 1;
  repeated PairingEncoding output_encodings = 2;
  RoleType preferred_role = 3;
}

message PairingConfiguration {
  PairingEncoding encoding = 1;
  RoleType client_role = 2;
}

message PairingConfigurationAck {}

message PairingSecret {
  bytes secret = 1;
}

message PairingSecretAck {
  bytes secret = 1;
}

message PairingMessage {
  enum Status {
    UNKNOWN = 0;
    STATUS_OK = 200;
    STATUS_ERROR = 400;
    STATUS_BAD_CONFIGURATION = 401;
    STATUS_BAD_SECRET = 402;
  }
  int32 protocol_version = 1;
  Status status = 2;
  int32 request_case = 3;
  PairingRequest pairing_request = 10;
  PairingRequestAck pairing_request_ack = 11;
  PairingOption pairing_option = 20;
  PairingConfiguration pairing_configuration = 30;
  PairingConfigurationAck pairing_configuration_ack = 31;
  PairingSecret pairing_secret = 40;
  PairingSecretAck pairing_secret_ack = 41;
}
`;

const root = protobuf.parse(PAIRING_PROTO).root;
const PairingMessage = root.lookupType('pairing.PairingMessage');
const Status = root.lookupEnum('pairing.PairingMessage.Status').values;
const RoleType = root.lookupEnum('RoleType').values;
const EncodingType = root.lookupEnum('pairing.PairingEncoding.EncodingType').values;

function create(payload: Record<string, unknown>): Uint8Array {
  const err = PairingMessage.verify(payload);
  if (err) {
    throw new Error(err);
  }
  const message = PairingMessage.create(payload);
  return PairingMessage.encodeDelimited(message).finish();
}

export const pairingMessages = {
  Status,
  createPairingRequest(serviceName: string, clientName = 'Vissiuss') {
    return create({
      pairingRequest: { serviceName, clientName },
      status: Status.STATUS_OK,
      protocolVersion: 2,
    });
  },
  createPairingOption() {
    return create({
      pairingOption: {
        preferredRole: RoleType.ROLE_TYPE_INPUT,
        inputEncodings: [{ type: EncodingType.ENCODING_TYPE_HEXADECIMAL, symbolLength: 6 }],
      },
      status: Status.STATUS_OK,
      protocolVersion: 2,
    });
  },
  createPairingConfiguration() {
    return create({
      pairingConfiguration: {
        clientRole: RoleType.ROLE_TYPE_INPUT,
        encoding: { type: EncodingType.ENCODING_TYPE_HEXADECIMAL, symbolLength: 6 },
      },
      status: Status.STATUS_OK,
      protocolVersion: 2,
    });
  },
  createPairingSecret(secret: Uint8Array | number[]) {
    return create({
      pairingSecret: { secret },
      status: Status.STATUS_OK,
      protocolVersion: 2,
    });
  },
  parse(buffer: Uint8Array) {
    return PairingMessage.decodeDelimited(buffer) as unknown as {
      status: number;
      pairingRequestAck?: unknown;
      pairingOption?: unknown;
      pairingConfigurationAck?: unknown;
      pairingSecretAck?: unknown;
    };
  },
};
