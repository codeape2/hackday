class MockRRB3(object):
    def set_driver_pins(self, left_pwm, left_dir, right_pwm, right_dir):
        print "set_driver_pins!"

    def get_distance(self):
        return 2.34