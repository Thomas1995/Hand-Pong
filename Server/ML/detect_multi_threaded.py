import datetime
import argparse
import cv2
import multiprocessing
import time
import tensorflow as tf

from multiprocessing import Queue, Pool
#from ML.utils import detector_utils as detector_utils

frame_processed = 0
score_thresh = 0.2

# Create a worker thread that loads graph and
# does detection on images in an input queue and puts it on an output queue
def worker(input_q, output_q, score_q, cap_params, frame_processed):
    hand_cascade = cv2.CascadeClassifier('ML/hand.xml')
    #detection_graph, sess = detector_utils.load_inference_graph()
    #sess = tf.Session(graph=detection_graph)
    while True:
        frame = input_q.get()
        if frame is not None:
            # actual detection
            frame = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
            hands = hand_cascade.detectMultiScale(frame)
            #boxes, scores = detector_utils.detect_objects(
            #    frame, detection_graph, sess)

            score = -1
            #if scores[0] > score_thresh:
                # score = cap_params['im_height'] / (cap_params['im_height'] + ((bottom + top) / 2))
            #    score = 1 - ((boxes[0][2] * cap_params['im_height'] + boxes[0][0] * cap_params['im_height']) / 2) / (cap_params['im_height'])

            best_match = 0
            best_x = -1
            best_y = -1
            best_w = -1
            best_h = -1
            for (x,y,w,h) in hands:
                if w + h > best_match:
                  best_match = w + h
                  best_x = x
                  best_y = y
                  best_w = w
                  best_h = h

            if best_y != -1:
              score = 1 - (best_y / frame.shape[1])

            output_q.put(frame)
            score_q.put(score)

            frame_processed += 1
        else:
            output_q.put(frame)
            score_q.put(-1)
    sess.close()

class Model(object):
    def __init__(self,
                 num_hands=1,
                 width=300,
                 height=300,
                 num_workers=6,
                 queue_size=5):
        """
        Args:
            num_hands: Max number of hands to detect.
            width: Width of the frames.
            height: Height of the frames.
            num_workers: Number of workers.
            queue_size: Size of the queue.
        """

        self._args = {}
        self._args['num_hands'] = num_hands
        self._args['width'] = width
        self._args['height'] = height
        self._args['num_workers'] = num_workers
        self._args['queue_size'] = queue_size

        self.pool = None
        self.index = 0
        self.num_frames = 0
        self.fps = 0

    def load_model(self):
        self.input_q = Queue(maxsize=self._args['queue_size'])
        self.output_q = Queue(maxsize=self._args['queue_size'])
        self.score_q = Queue(maxsize=self._args['queue_size'])

        cap_params = {}
        frame_processed = 0
        cap_params['im_width'], cap_params['im_height'] = self._args['width'], self._args['height']
        cap_params['score_thresh'] = score_thresh

        # max number of hands we want to detect/track
        cap_params['num_hands_detect'] = self._args['num_hands']

        print(cap_params, self._args)

        # spin up workers to paralleize detection.
        self.pool = Pool(self._args['num_workers'], worker,
                         (self.input_q, self.output_q, self.score_q, cap_params, frame_processed))

    def inference_frame(self, frame):
        # frame = video_capture.read()
        if self.index == 0:
            self.start_time = datetime.datetime.now()

        frame = cv2.flip(frame, 1)
        self.index += 1

        self.input_q.put(frame)
        self.output_q.get()
        score = self.score_q.get()

        elapsed_time = (datetime.datetime.now() -
                        self.start_time).total_seconds()
        self.num_frames += 1
        self.fps = self.num_frames / elapsed_time

        print ("fps:{0}", self.fps)
        return score

    def stop_inference(self):
        self.pool.terminate()
        cv2.destroyAllWindows()
