import "." as Skin
import Mixxx 1.0 as Mixxx
import QtQuick 2.12

Skin.MiniKnob {
    id: root

    property alias group: control.group
    property alias key: control.key

    value: control.parameter
    onTurned: control.parameter = value

    Mixxx.ControlProxy {
        id: control
    }

    TapHandler {
        onDoubleTapped: control.reset()
    }
}
