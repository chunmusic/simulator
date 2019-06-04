/**
 * Copyright (c) 2019 LG Electronics, Inc.
 *
 * This software contains code licensed as described in LICENSE.
 *
 */

using UnityEngine;

namespace Simulator.Bridge.Data
{
    public class GpsData
    {
        public uint Sequence;
        public string Frame;

        public double Latitude;
        public double Longitude;
        public double Altitude;

        public double Northing;
        public double Easting;

        public Quaternion Orientation;
    }

    public class GpsOdometryData
    {
        public uint Sequence;
        public string Frame;
        public string ChildFrame;

        public double Latitude;
        public double Longitude;
        public double Altitude;

        public double Northing;
        public double Easting;

        public Quaternion Orientation;

        public float ForwardSpeed; // m/s
        public Vector3 Velocity;
        public Vector3 AngularVelocity;
    }

    public class GpsInsData
    {
        public uint Sequence;
        public string Frame;

        public uint Status;
        public uint PositionType;
    }
}