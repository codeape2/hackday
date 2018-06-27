import time


class MockRRB3(object):
    def left(self):
        print "turning left"
        time.sleep(1)
        print("that took some time!")

    def right(self):
        print "going left"

    def stop(self):
        print "stopping"

    def forward(self):
        print "going forward"

    def reverse(self, speed):
        print "going in reverse"

    def set_driver_pins(self, left_pwm, left_dir, right_pwm, right_dir):
        print "set_driver_pins!"

    def get_distance(self):
        return 2.34