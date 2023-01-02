export class QuaternionRotation {

    static calcRotation(x, z) {
        const sinX = Math.sin(x / 2);
        const cosX = Math.cos(x / 2);
        const sinZ = Math.sin(z / 2);
        const cosZ = Math.cos(z / 2);

        return [cosZ * cosX, sinZ * cosX, sinZ * sinX, cosZ * sinX];
    }

    static xz(quat, xRotation, zRotation) {
        const rotation = QuaternionRotation.calcRotation(xRotation, zRotation);
        const [qW, qX, qY, qZ] = quat;
        const [rW, rX, rY, rZ] = rotation;

        const w = qW * rW - qX * rX - qY * rY - qZ * rZ;
        const x = qW * rX + qX * rW + qY * rZ - qZ * rY;
        const y = qW * rY - qX * rZ + qY * rW + qZ * rX;
        const z = qW * rZ + qX * rY - qY * rX + qZ * rW;

        return [w, x, y, z];
    }
}