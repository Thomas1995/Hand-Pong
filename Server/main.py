import cv2

from ML.detect_multi_threaded import Model
from ML.utils.detector_utils import WebcamVideoStream

args = {}
args['video_source'] = 0
args['width'] = 300
args['height'] = 300

video_capture = WebcamVideoStream(src=args['video_source'],
                                  width=args['width'],
                                  height=args['height']).start()

model = Model(display=0)
model.load_model()
while True:
    frame = video_capture.read()
    if cv2.waitKey(1) & 0xFF == ord('q'):
        break
    score = model.inference_frame(frame)
    print(score)
