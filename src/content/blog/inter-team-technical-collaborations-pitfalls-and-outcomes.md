---
title: 'Inter-team technical collaborations, pitfalls and outcomes'
description: 'How to lead cross-team engineering projects and stay organized with timelines, deliverables and expectations.'
publishDate: '2023-09-18'
tags:
  - engineering
  - leadership
draft: true
comment: true
---

Often times software engineers come across projects that transcend their expertise or area of influence. This can be in the form of many things such as a new stack of infrastructure managed by a different team or services built on top of unfamiliar languages, frameworks and technologies.

Such problems are not new in the software engineering world and there isn't necessarily a one-solution-fits-all method that can be applied across the board.

In my experience as an engineer, these situations arise naturally especially as you grow in your career and seniority. Instead of succumbing to team and organization bureaucracy, there are better ways to lead engineering projects and stay organized with your timelines, deliverables and expectations.

## Projects spanning multiple areas of infrastructure and expertise

It's usually comparatively trivial to manage projects within a team (or teams under an umbrella) than it's to manage projects that are dependent on another independent team (potentially under a different company organization). If such projects aren't scoped well, this can lead to multiple challenges such as:

- Misaligned inter-team OKRs
- Engineering over-expectation from the management
- Project over / under estimations
- Delayed pull requests and design doc reviews

## Multiple orgs, different teams, tied OKRs

Before diving deep, let's draw some team personas below.

Team Alpha is a data platform team that manages the data infrastructure. They are the gatekeepers of batch systems, responsible for building, evaluating and maintaining the data infrastructure along with its SLAs and SLOs.

This team also owns a complex **batch** feature store pipeline that powers a latency sensitive **online** feature store built on top of Redis and DynamoDB.

Team Bravo on the other hand is a backend focused search product and infrastructure team that builds and ships search related products for their e-commerce platform. This can range from products such as related searches, keyword search and infrastructure monitoring such as search latency optimization.

This team also historically owns the infrastructure of the **online** feature store which is one of the main component for feature retrieval at low latency.

### Subject matter expertise

Although Team Bravo owns the infrastructure of the online feature store, they are not very familiar with why and how the data structure in the online feature store is structured. They also lack the historical context of how the online feature store was designed. The following describes the data-structure of the online feature store:

```
<entity_type>::<identifier>: {
  feature1: value,
  feature2: value,
  ...
  feature99: value,
  featureN: value,
}
```

Team Bravo fully understands that the number of bytes on wire for each request is quite large and one of the biggest contributors to high average latency for each request that serves a model prediction. However they aren't the subject matter experts on how to shard this data for efficient retrieval for purposes such as online inference.

Since Team Alpha owns and maintains the offline feature store, they are the domain experts of this data structure and consistently liaise with data scientists to understand their model training and development requirements. They propose the following changes to the data structure in the online feature store:

- Introduce a model manifest that contains list of all the features that are required by a given model. This manifest is included in the model artifact and saved in the global model registry.
- Introduce a sharded data model such that

### Misaligned inter-team OKRs
