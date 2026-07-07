---
title: Twelve Services, Three Users
label: "Wrong direction."
year: "2020"
---

## What it was

A greenfield internal product I architected as twelve microservices
from day one. Kubernetes, service mesh, the works. It had three users.

## Why it died

Every feature touched four services. Development speed collapsed under
the operational weight before the product could prove itself. The
product was cancelled; the architecture outlived the need it never had.

## What it taught me

Architecture must match the team and the moment, not the conference
talk. Now I start with the boring monolith and earn every service
split with evidence. Distribution is a cost you pay, not a badge.
