export class QuaternionRotation {

    static calcXZ(x, z) {
        const sinX = Math.sin(x / 2);
        const cosX = Math.cos(x / 2);
        const sinZ = Math.sin(z / 2);
        const cosZ = Math.cos(z / 2);

        return [
            cosZ * cosX,
            sinZ * cosX,
            sinZ * sinX,
            cosZ * sinX
        ];
    }

    static rotate(quat, rotation) {
        const [qW, qX, qY, qZ] = quat;
        const [rW, rX, rY, rZ] = rotation;

        return [
            qW * rW - qX * rX - qY * rY - qZ * rZ,
            qW * rX + qX * rW + qY * rZ - qZ * rY,
            qW * rY - qX * rZ + qY * rW + qZ * rX,
            qW * rZ + qX * rY - qY * rX + qZ * rW,
        ]
    }
}