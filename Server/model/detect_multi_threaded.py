import datetime
import argparse
import cv2
import multiprocessing
import time
import tensorflow as tf

from multiprocessing import Queue, Pool
from utils.detector_utils import WebcamVideoStream
from utils import detector_utils as detector_utils

frame_processed = 0
score_thresh = 0.2

# Create a worker thread that loads graph and
# does detection on images in an input queue and puts it on an output queue
def worker(input_q, output_q, score_q, cap_params, frame_processed):
    print(">> loading frozen model for worker")
    detection_graph, sess = detector_utils.load_inference_graph()
    sess = tf.Session(graph=detection_graph)
    while True:
        # print("> ===== in worker loop, frame ", frame_processed)
        frame = input_q.get()
        if frame is not None:
            # actual detection
            boxes, scores = detector_utils.detect_objects(
                frame, detection_graph, sess)

            # draw bounding boxes
            # detector_utils.draw_box_on_image(
            #     cap_params['num_hands_detect'], cap_params["score_thresh"], scores, boxes, cap_params['im_width'],
            #     cap_params['im_height'], frame)

            score = -1
            if scores[0] > score_thresh:
                # score = cap_params['im_height'] / (cap_params['im_height'] + ((bottom + top) / 2))
                score = 1 - ((boxes[0][2] * cap_params['im_height'] + boxes[0][0] * cap_params['im_height']) / 2) / (cap_params['im_height'])
            output_q.put(frame)
            score_q.put(score)

            frame_processed += 1
        else:
            output_q.put(frame)
            score_q.put(-1)
    sess.close()

class DefaultConfig(object):
    def __init__(self):
        super()
        self.parser = argparse.ArgumentParser()
        self.parser.add_argument('-src', '--source', dest='video_source', type=int,
                                 default=0, help='Device index of the camera.')
        self.parser.add_argument('-nhands', '--num_hands', dest='num_hands', type=int,
                                 default=1, help='Max number of hands to detect.')
        self.parser.add_argument('-fps', '--fps', dest='fps', type=int,
                                 default=1, help='Show FPS on detection/display visualization')
        self.parser.add_argument('-wd', '--width', dest='width', type=int,
                                 default=300, help='Width of the frames in the video stream.')
        self.parser.add_argument('-ht', '--height', dest='height', type=int,
                                 default=300, help='Height of the frames in the video stream.')
        self.parser.add_argument('-ds', '--display', dest='display', type=int,
                                 default=1, help='Display the detected images using OpenCV. This reduces FPS')
        self.parser.add_argument('-num-w', '--num-workers', dest='num_workers', type=int,
                                 default=4, help='Number of workers.')
        self.parser.add_argument('-q-size', '--queue-size', dest='queue_size', type=int,
                                 default=5, help='Size of the queue.')
        self.args = self.parser.parse_args()

    def get_args(self):
        return self.args

class NoDisplayConfig(object):
    def __init__(self):
        super()
        self.parser = argparse.ArgumentParser()
        self.parser.add_argument('-src', '--source', dest='video_source', type=int,
                                 default=0, help='Device index of the camera.')
        self.parser.add_argument('-nhands', '--num_hands', dest='num_hands', type=int,
                                 default=1, help='Max number of hands to detect.')
        self.parser.add_argument('-fps', '--fps', dest='fps', type=int,
                                 default=1, help='Show FPS on detection/display visualization')
        self.parser.add_argument('-wd', '--width', dest='width', type=int,
                                 default=300, help='Width of the frames in the video stream.')
        self.parser.add_argument('-ht', '--height', dest='height', type=int,
                                 default=300, help='Height of the frames in the video stream.')
        self.parser.add_argument('-ds', '--display', dest='display', type=int,
                                 default=0, help='Display the detected images using OpenCV. This reduces FPS')
        self.parser.add_argument('-num-w', '--num-workers', dest='num_workers', type=int,
                                 default=6, help='Number of workers.')
        self.parser.add_argument('-q-size', '--queue-size', dest='queue_size', type=int,
                                 default=5, help='Size of the queue.')
        self.args = self.parser.parse_args()

    def get_args(self):
        return self.args

class Model(object):
    def __init__(self):
        self.config = NoDisplayConfig()
        self.args = self.config.get_args()
        self.pool = None
        self.index = 0
        self.num_frames = 0
        self.fps = 0

    def load_model(self):
        args = self.args
        self.input_q = Queue(maxsize=args.queue_size)
        self.output_q = Queue(maxsize=args.queue_size)
        self.score_q = Queue(maxsize=args.queue_size)

        # video_capture = WebcamVideoStream(src=args.video_source,
        #                                   width=args.width,
        #                                   height=args.height).start()

        cap_params = {}
        frame_processed = 0
        cap_params['im_width'], cap_params['im_height'] = 300, 300
        cap_params['score_thresh'] = score_thresh

        # max number of hands we want to detect/track
        cap_params['num_hands_detect'] = args.num_hands

        print(cap_params, args)

        # spin up workers to paralleize detection.
        self.pool = Pool(args.num_workers, worker,
                         (self.input_q, self.output_q, self.score_q, cap_params, frame_processed))

    def inference_frame(self, frame):
        # frame = video_capture.read()
        if self.index == 0:
            self.start_time = datetime.datetime.now()

        frame = cv2.flip(frame, 1)
        self.index += 1

        self.input_q.put(cv2.cvtColor(frame, cv2.COLOR_BGR2RGB))
        output_frame = self.output_q.get()
        score = self.score_q.get()
        # print(score, ' score here')

        output_frame = cv2.cvtColor(output_frame, cv2.COLOR_RGB2BGR)

        elapsed_time = (datetime.datetime.now() -
                        self.start_time).total_seconds()
        self.num_frames += 1
        self.fps = self.num_frames / elapsed_time
        # print("frame ",  index, num_frames, elapsed_time, fps)

        if output_frame is not None:
            if self.args.display > 0:
                if self.args.fps > 0:
                    detector_utils.draw_fps_on_image(
                        "FPS : " + str(int(self.fps)), output_frame)
                cv2.imshow('Muilti - threaded Detection', output_frame)
                # if cv2.waitKey(1) & 0xFF == ord('q'):
                #     break
            else:
                if self.num_frames == 400:
                    self.num_frames = 0
                    self.start_time = datetime.datetime.now()
                else:
                    print ("fps:{0}", self.fps)
                    # print("frames processed: ", self.index,
                          # "elapsed time: ", elapsed_time, "fps: ", str(int(self.fps)))
                    # print("input queue size ", self.input_q.qsize())
                    # print("output queue size ", self.output_q.qsize())
        return score

    def stop_inference(self):
        self.pool.terminate()
        # video_capture.stop()
        cv2.destroyAllWindows()
