class MockMPU6050:
    def get_gyro_data(self):
        return {"x": 0.0, "y": 0.0, "z": 0.0}

    def get_accel_data(self):
        return {"x": 0.0, "y": 0.0, "z": 0.0}

    def get_temp(self):
        return 20.0