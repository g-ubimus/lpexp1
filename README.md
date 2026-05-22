litePlay experiment
===

To start the study, run:
`npx serve`

After finishing the test, data should be automatically downloaded (one file for each session).

Processing data
---

A Python script is available to process lab.js data into flattened csv files, while also merging results into a single file.
To use it, copy all user data into the RAW_DATA folder, then:

`python3 -m venv venv`

To create a virtualenv, then:

`pip3 install -r requirements.txt`

Finally, run:

`python3 main.py`
