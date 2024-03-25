////////////////////////////////////////////////////////////////////////
// JSHint configuration                                               //
////////////////////////////////////////////////////////////////////////
/* global engine                                                      */
/* global script                                                      */
/* global print                                                       */
/* global midi                                                        */
////////////////////////////////////////////////////////////////////////
var BehringerCMDMicro = {};

// Configurable Options
BehringerCMDMicro.ScratchAlpha  = 1.0 / 8;
BehringerCMDMicro.ScratchBeta   = BehringerCMDMicro.ScratchAlpha / 32;
BehringerCMDMicro.ScratchRPM    = 33 + (1.0 / 3);
BehringerCMDMicro.PitchBendsKey = false;

// Pitch Button State
BehringerCMDMicro.DownButtons   = [0, 0];
BehringerCMDMicro.PitchReset    = [false, false];

BehringerCMDMicro.wheelTouch = function(channel, control, value, status, grp) {
    const forChannel = Number(grp);
    if ((status & 0xF0) === 0x90) {
        engine.scratchEnable(forChannel,
            128,
            BehringerCMDMicro.ScratchRPM,
            BehringerCMDMicro.ScratchAlpha,
            BehringerCMDMicro.ScratchBeta,
            true);
    } else {
        engine.scratchDisable(forChannel, true);
    }
};

BehringerCMDMicro.wheelTick = function(channel, control, value, status, grp) {
    const forChannel = Number(grp);
    value -= 64;
    if (engine.isScratching(forChannel)) {
        engine.scratchTick(forChannel, value);
    } else {
        engine.setValue("[Channel" + grp + "]", "jog", value);
    }
};

if (BehringerCMDMicro.PitchBendsKey) {
    BehringerCMDMicro.pitch = function(channel, control, value, status, grp) {
        const forChannel = Number(grp);
        const up = (control === 0x21) || (control === 0x11);

        const btnIdx = forChannel-1;
        const btns = BehringerCMDMicro.DownButtons;
        if ((status & 0xF0) === 0x90) {
            btns[btnIdx] += 1;
            if (btns[btnIdx] >= 2) {
                BehringerCMDMicro.PitchReset[btnIdx] = true;
            }
        } else {
            btns[btnIdx] -= 1;
            if (BehringerCMDMicro.PitchReset[btnIdx]) {
                if (btns[btnIdx] === 0) {
                    BehringerCMDMicro.PitchReset[btnIdx] = false;
                    engine.setValue("[Channel" + grp + "]",
                        "pitch",
                        0);
                }
            } else {
                let cur = engine.getValue("[Channel" + grp + "]",
                    "pitch");
                if (up) {
                    cur += 1;
                } else {
                    cur -= 1;
                }
                engine.setValue("[Channel" + grp + "]",
                    "pitch",
                    cur);
            }
        }
    };
} else {
    BehringerCMDMicro.pitch = function(channel, control, value, status, grp) {
        // 0x11 is the left deck pitch bend up button, while 0x21 is the right.
        const up = (control === 0x11) || (control === 0x21);

        let signal = "rate_temp_down";
        if (up) {
            signal = "rate_temp_up";
        }

        const isNoteOn = (status & 0xF0) === 0x90;    // 0x90 is the 'Note On'
        // MIDI command, which is
        // sent when the button is
        // pressed down.

        engine.setValue("[Channel" + grp + "]", signal, isNoteOn);
    };
}
BehringerCMDMicro.shutdown = function() {};
BehringerCMDMicro.init = function(id, debugging) {};
