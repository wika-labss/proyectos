import protobuf from 'protobufjs';

/** Subconjunto del proto remoto (comandos que usamos). */
const REMOTE_PROTO = `
syntax = "proto3";
package remote;

enum RemoteKeyCode {
  KEYCODE_UNKNOWN = 0;
  KEYCODE_HOME = 3;
  KEYCODE_BACK = 4;
  KEYCODE_DPAD_UP = 19;
  KEYCODE_DPAD_DOWN = 20;
  KEYCODE_DPAD_LEFT = 21;
  KEYCODE_DPAD_RIGHT = 22;
  KEYCODE_DPAD_CENTER = 23;
  KEYCODE_VOLUME_UP = 24;
  KEYCODE_VOLUME_DOWN = 25;
  KEYCODE_VOLUME_MUTE = 164;
  KEYCODE_TV = 170;
  KEYCODE_TV_INPUT = 178;
  KEYCODE_TV_INPUT_HDMI_1 = 243;
  KEYCODE_TV_INPUT_HDMI_2 = 244;
  KEYCODE_TV_INPUT_HDMI_3 = 245;
  KEYCODE_TV_INPUT_HDMI_4 = 246;
  KEYCODE_TV_INPUT_COMPOSITE_1 = 247;
}

enum RemoteDirection {
  UNKNOWN_DIRECTION = 0;
  START_LONG = 1;
  END_LONG = 2;
  SHORT = 3;
}

message RemoteKeyInject {
  RemoteKeyCode key_code = 1;
  RemoteDirection direction = 2;
}

message RemotePingResponse {
  int32 val1 = 1;
}

message RemotePingRequest {
  int32 val1 = 1;
  int32 val2 = 2;
}

message RemoteSetActive {
  int32 active = 1;
}

message RemoteDeviceInfo {
  string model = 1;
  string vendor = 2;
  int32 unknown1 = 3;
  string unknown2 = 4;
  string package_name = 5;
  string app_version = 6;
}

message RemoteConfigure {
  int32 code1 = 1;
  RemoteDeviceInfo device_info = 2;
}

message RemoteStart {
  bool started = 1;
}

message RemoteSetVolumeLevel {
  uint32 volume_max = 6;
  uint32 volume_level = 7;
  bool volume_muted = 8;
}

message RemoteAppLinkLaunchRequest {
  string app_link = 1;
}

message RemoteMessage {
  RemoteConfigure remote_configure = 1;
  RemoteSetActive remote_set_active = 2;
  RemotePingRequest remote_ping_request = 8;
  RemotePingResponse remote_ping_response = 9;
  RemoteKeyInject remote_key_inject = 10;
  RemoteStart remote_start = 40;
  RemoteSetVolumeLevel remote_set_volume_level = 50;
  RemoteAppLinkLaunchRequest remote_app_link_launch_request = 90;
}
`;

const root = protobuf.parse(REMOTE_PROTO).root;
const RemoteMessage = root.lookupType('remote.RemoteMessage');
export const RemoteKeyCode = root.lookupEnum('remote.RemoteKeyCode').values as Record<string, number>;
export const RemoteDirection = root.lookupEnum('remote.RemoteDirection').values as Record<string, number>;

function create(payload: Record<string, unknown>): Uint8Array {
  const err = RemoteMessage.verify(payload);
  if (err) {
    throw new Error(err);
  }
  const message = RemoteMessage.create(payload);
  return RemoteMessage.encodeDelimited(message).finish();
}

export const remoteMessages = {
  createRemoteConfigure() {
    return create({
      remoteConfigure: {
        code1: 622,
        deviceInfo: {
          model: 'Vissiuss',
          vendor: 'WIKA',
          unknown1: 1,
          unknown2: '1',
          packageName: 'com.wika.vissiuscontrolremote',
          appVersion: '3.0.0',
        },
      },
    });
  },
  createRemoteSetActive(active: number) {
    return create({ remoteSetActive: { active } });
  },
  createRemotePingResponse(val1: number) {
    return create({ remotePingResponse: { val1 } });
  },
  createRemoteKeyInject(keyCode: number, direction: number) {
    return create({ remoteKeyInject: { keyCode, direction } });
  },
  createAppLink(appLink: string) {
    return create({ remoteAppLinkLaunchRequest: { appLink } });
  },
  parse(buffer: Uint8Array) {
    return RemoteMessage.decodeDelimited(buffer) as unknown as {
      remoteConfigure?: unknown;
      remoteSetActive?: { active?: number };
      remotePingRequest?: { val1?: number };
      remoteStart?: { started?: boolean };
      remoteSetVolumeLevel?: {
        volumeLevel?: number;
        volumeMax?: number;
        volumeMuted?: boolean;
      };
    };
  },
};
