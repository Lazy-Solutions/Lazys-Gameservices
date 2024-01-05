import msgpack from 'msgpack-lite';

export const MsgCodec = {
    encode: function(message) {
        return msgpack.encode(message);
    },

    decode: function (payload) {
        return msgpack.decode(payload);
    }
}