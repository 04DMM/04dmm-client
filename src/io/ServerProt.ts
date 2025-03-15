export const enum ServerProt {
    // interfaces
    IF_OPENCHATMODAL = 14,
    IF_OPENMAINSIDEMODAL = 28,
    IF_CLOSE = 129,
    IF_OPENSIDEOVERLAY = 167,
    IF_OPENMAINMODAL = 168,
    IF_OPENSIDEMODAL = 195,

    // updating interfaces
    IF_SETCOLOUR = 2,
    IF_SETHIDE = 26,
    IF_SETOBJECT = 46,
    IF_SHOWSIDE = 84,
    IF_SETMODEL = 87,
    IF_SETRECOL = 103,
    IF_SETANIM = 146,
    IF_SETPLAYERHEAD = 197,
    IF_SETTEXT = 201,
    IF_SETNPCHEAD = 204,
    IF_SETPOSITION = 209,

    // tutorial area
    TUTORIAL_FLASHSIDE = 126,
    TUTORIAL_OPENCHAT = 185,

    // inventory
    UPDATE_INV_STOP_TRANSMIT = 15,
    UPDATE_INV_FULL = 98,
    UPDATE_INV_PARTIAL = 213,

    // camera control
    CAM_LOOKAT = 74,
    CAM_SHAKE = 13,
    CAM_MOVETO = 3,
    CAM_RESET = 239,

    // entity updates
    NPC_INFO = 1,
    PLAYER_INFO = 184,

    // input tracking
    FINISH_TRACKING = 133,
    ENABLE_TRACKING = 226,

    // social
    MESSAGE_GAME = 4,
    UPDATE_IGNORELIST = 21,
    CHAT_FILTER_SETTINGS = 32,
    MESSAGE_PRIVATE = 41,
    UPDATE_FRIENDLIST = 152,

    // misc
    UNSET_MAP_FLAG = 19,
    UPDATE_RUNWEIGHT = 22,
    HINT_ARROW = 25,
    UPDATE_REBOOT_TIMER = 43,
    UPDATE_STAT = 44,
    UPDATE_RUNENERGY = 68,
    RESET_ANIMS = 136,
    UPDATE_PID = 139,
    LAST_LOGIN_INFO = 140,
    LOGOUT = 142,
    P_COUNTDIALOG = 243,
    SET_MULTIWAY = 254,

    // maps
    DATA_LOC_DONE = 20,
    DATA_LAND_DONE = 80,
    DATA_LAND = 132,
    DATA_LOC = 220,
    REBUILD_NORMAL = 237,

    // vars
    VARP_SMALL = 150,
    VARP_LARGE = 175,
    RESET_CLIENT_VARCACHE = 193,

    // audio
    SYNTH_SOUND = 12,
    MIDI_SONG = 54,
    MIDI_JINGLE = 212,

    // zones
    UPDATE_ZONE_PARTIAL_FOLLOWS = 7,
    UPDATE_ZONE_FULL_FOLLOWS = 135,
    UPDATE_ZONE_PARTIAL_ENCLOSED = 162,

    // zone protocol
    LOC_MERGE = 23,
    LOC_ANIM = 42,
    OBJ_DEL = 49,
    OBJ_REVEAL = 50,
    LOC_ADD_CHANGE = 59,
    MAP_PROJANIM = 69,
    LOC_DEL = 76,
    OBJ_COUNT = 151,
    MAP_ANIM = 191,
    OBJ_ADD = 223
};

// prettier-ignore
export const ServerProtSizes = [
    0, -2, 4, 6, -1, 0, 0, 2, 0, 0,
    0, 0, 5, 4, 2, 2, 0, 0, 0, 0, 2,
    -2, 2, 14, 0, 6, 3, 0, 4, 0, 0,
    0, 3, 0, 0, 0, 0, 0, 0, 0, 0, -1,
    4, 2, 6, 0, 6, 0, 0, 3, 7, 0, 0,
    0, -1, 0, 0, 0, 0, 4, 0, 0, 0, 0,
    0, 0, 0, 0, 1, 15, 0, 0, 0, 0, 6,
    0, 2, 0, 0, 0, 2, 0, 0, 0, 1, 0,
    0, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    -2, 0, 0, 0, 0, 6, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0,
    -2, 0, 0, 2, 0, 0, 0, 2, 9, 0, 0, 0,
    0, 0, 4, 0, 0, 0, 3, 7, 9, 0, 0, 0,
    0, 0, 0, 0, 0, 0, -2, 0, 0, 0, 0, 3,
    2, 0, 0, 0, 0, 0, 0, 6, 0, 0, 0, 0,
    0, 0, 0, 0, -2, 2, 0, 0, 0, 0, 0, 6,
    0, 0, 0, 2, 0, 2, 0, 0, 0, -2, 0, 0,
    4, 0, 0, 0, 0, 6, 0, 0, -2, -2, 0, 0,
    0, 0, 0, 0, -2, 0, 0, 5, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, -2, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 1, 0, 0
];
