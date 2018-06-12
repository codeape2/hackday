from argparse import ArgumentParser


def navigate_maze(stepsize, turndegrees, outputfile):
    pass


def main():
    parser = ArgumentParser()
    parser.add_argument("stepsize", type=int)
    parser.add_argument("turndegrees", type=int)
    parser.add_argument("outputfile")

    args = parser.parse_args()

    navigate_maze(args.stepsize, args.turndegrees, args.outputfile)


if __name__ == "__main__":
    main()