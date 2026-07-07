---
title: The Realtime Everything Dashboard
label: "Didn't work."
year: "2019"
---

## What it was

A dashboard that streamed *every* metric of *every* service live over
websockets. Beautiful demo. Nobody asked for it.

## Why it died

It answered no question anyone actually had. Real incidents needed
history and context, not a firehose of now. It also fell over at the
first real traffic spike — the irony of a monitoring tool causing load.

## What it taught me

Build for a question, not for a capability. "Because it's possible"
is a demo, not a product. The monitoring stack I built afterwards
started from three questions on a sticky note — that one shipped.
