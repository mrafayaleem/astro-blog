---
title: Supercharging Claude CLI with Tart Virtualization on Apple Silicon
description: My take on sandboxing Claude CLI and other harnesses on Apple devices without headaches
publishDate: 2026-06-19
tags:
  - personal
  - productivity
  - ai-retooling
draft: false
comment: true
---
A few months ago, I wrote about [leveraging a Claude-Obsidian](/blog/improving-personal-tax-filing-with-claude-obsidian) based workflow to help with my personal tax filing. I have been experimenting with similar iterations of these workflows both at work and in personal settings and one thing that I have struggled with is how to safely run various LLM harnesses with the infamous `--dangerously-skip-permissions` flag and the likes.

I have found LLM harnesses to be much more effective at completing work without constantly nagging me for permissions but never felt comfortable running them with such elevated permissions on my MacBook.

In case of working with Obsidian and creating a personal knowledge base, I ended up using guest VMs on both, a remote Unraid homelab server and my Macbook and using Syncthing to sync LLM edits back to my MacBook. For the most part, this worked fine, but proved to be unnecessarily complex for a simple thing that I was trying to do:

> Have a file based workflow such that the LLM has unlimited permissions to install packages, execute code, browse the internet, etc. while having edit permissions on strictly a specific set of directories on the host OS.

I have used VMWare Fusion to create Ubuntu VMs to support this workflow, which usually involves installing a full Ubuntu setup and syncing directories either via Syncthing or Shared Folders, the latter of which is more involved than I would want for a runaway sandbox. I also find VMWare Fusion VM much more bloated and resource hungry for what I would want to see with a simple sandboxed environment for the harness.

Recently, I came across [Tart](https://tart.run/) which is a thin CLI wrapper on top of the Apple Virtualization framework and I decided to give it a spin to see if it fits the bill.

It's quite simple to start with one and here is how it goes:
## 0. Create the VM (one-time setup)

Clone a base image from the Cirrus Labs registry:

```bash
tart clone ghcr.io/cirruslabs/ubuntu:latest ubuntu
```

Resize the disk if needed (size in GB; do this while the VM is stopped):

```bash
tart set ubuntu --disk-size 50
```

Ubuntu cloud images auto-grow the root partition on next boot, so no manual `growpart`/`resize2fs` is needed — verify with `df -h /` inside the guest.
## 1. Start the VM with the directory share
```bash
tart run --dir=obsidian_vault:/Users/rafaypersonal/Documents/obsidian_vault ubuntu &
```
This mounts the provided host directory into the VM. This can be anything such as your code repo, personal markdown, etc.
- Format is `--dir=<name>:<host-path>` — the `<name>` becomes the subdirectory name inside the guest.
- Append `:ro` to the host path for read-only (e.g. `--dir=obsidian_vault:/path:ro`).
- Multiple `--dir` flags are allowed; all shares appear under the same mount point.
## 2. SSH into the VM

```bash
ssh admin@$(tart ip ubuntu)
```
## 3. Mount the virtiofs share (Linux does NOT auto-mount)

Tart exposes all `--dir` shares as a single virtiofs device tagged `com.apple.virtio-fs.automount`. Do the following inside the VM:

```bash
sudo mkdir -p /mnt/shared
sudo mount -t virtiofs com.apple.virtio-fs.automount /mnt/shared
```

Each share appears as a subdirectory named after its `<name>` label:

```
/mnt/shared/obsidian_vault
```

(macOS guests auto-mount at `/Volumes/My Shared Files/<name>` — only Linux needs the manual mount, and this example is based on Ubuntu.)
## 4. Make the mount persist across reboots
Since you would not want to repeat the mount step on every VM start, you can persist it across reboots.

Add to `/etc/fstab` inside the VM:

```
com.apple.virtio-fs.automount /mnt/shared virtiofs rw,nofail 0 0
```

One-liner (idempotent):

```bash
sudo bash -c 'grep -q virtiofs /etc/fstab || echo "com.apple.virtio-fs.automount /mnt/shared virtiofs rw,nofail 0 0" >> /etc/fstab'
```

Validate with:

```bash
sudo mount -a && echo OK   # should print OK with no parse errors
mount | grep virtiofs      # confirm the mount is active
```

`nofail` matters: without it, booting the VM *without* the `--dir` flag would hang or drop to emergency mode when the device is missing.

**And that's it!** You can now install and run Claude and other harnesses in the VM with the `--dangerously-skip-permissions` and feel less uncomfortable about bricking your system.

If you are working as developer, you can also access VM ports from the host via localhost  by simply SSH local forwarding.
```bash
ssh -f -N -L 8080:localhost:8080 -L 3000:localhost:3000 admin@$(tart ip ubuntu)
```
## Conclusion
Cirrus Labs, the company behind Tart is now part of OpenAI so I am assuming the ChatGPT/Codex Desktop apps also use Tart for sandboxing (although I doubt the CLI does).

However, I have found fully sandboxed environments for CLI very liberating, alleviating my security concerns of bricking my host machines. Having it as a lightweight self-contained native and reproducible headless VM for development workflows has been amazing!

Arguably, this workflow is better than Docker containers because of persistence where you will have to map your system directories to named volumes to survive restarts.

