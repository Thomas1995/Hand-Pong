import datetime
import argparse
import cv2
import multiprocessing
import time
import tensorflow as tf

from multiprocessing import Queue, Pool
#from ML.utils import detector_utils as detector_utils

# score_thresh = 0.2

# Create a worker thread that loads graph and
# does detection on images in an input queue and puts it on an output queue
def worker(input_q, score_q):
    hand_cascade = cv2.CascadeClassifier('ML/hand.xml')
    #detection_graph, sess = detector_utils.load_inference_graph()
    #sess = tf.Session(graph=detection_graph)
    while True:
        frame = input_q.get()
        if frame is not None:
            # actual detection
            #frame = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
            hands = hand_cascade.detectMultiScale(frame)
            #boxes, scores = detector_utils.detect_objects(
            #    frame, detection_graph, sess)

            score = -1
            #if scores[0] > score_thresh:
                # score = 1 - ((boxes[0][2] * cap_params['im_height'] + boxes[0][0] * cap_params['im_height']) / 2) / (cap_params['im_height'])

            best_match = -1
            best_y = -1
            for (x,y,w,h) in hands:
                if w * h > best_match:
                  best_match = w + h
                  best_y = y

            if best_match != -1:
              score = 1 - (best_y / frame.shape[1])
              if score > 0.2 and score < 0.9:
                score = (score - 0.2) / 0.7
              elif score <= 0.2:
                score = 0
              else:
                score = 1

            score_q.put(score)
        else:
            score_q.put(-1)
    # sess.close()

class Model(object):
    def __init__(self,
                 num_hands=1,
                 num_workers=6,
                 queue_size=5):
        """
        Args:
            num_hands: Max number of hands to detect.
            num_workers: Number of workers.
            queue_size: Size of the queue.
        """

        self._args = {}
        self._args['num_hands'] = num_hands
        self._args['num_workers'] = num_workers
        self._args['queue_size'] = queue_size

        self.pool = None
        self.index = 0
        self.num_frames = 0
        self.fps = 0

    def load_model(self):
        self.input_q = Queue(maxsize=self._args['queue_size'])
        self.score_q = Queue(maxsize=self._args['queue_size'])

        print(self._args)

        # spin up workers to paralleize detection.
        self.pool = Pool(self._args['num_workers'], worker,
                         (self.input_q, self.score_q))

    def inference_frame(self, frame):
        if self.index == 0:
            self.start_time = datetime.datetime.now()
        self.index = 1

        self.input_q.put(frame)
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
