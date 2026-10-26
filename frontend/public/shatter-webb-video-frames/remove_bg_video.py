"""Background removal for frames extracted from the user's shatter video.
Same colour rules as the stills (blue studio + red stripe -> black),
but keep tiny fragments: components >= 5 px, not 30, so gold dust and
small shards in the video do not vanish. No hole-filling (handle loops
and gaps between pieces must stay black).
"""
import os
import numpy as np
from PIL import Image, ImageFilter
from scipy import ndimage

SRC = '/home/hatch/workspace/trophy-webb/video-frames'
OUT = '/home/hatch/workspace/trophy-webb/video-black'
os.makedirs(OUT, exist_ok=True)

for i in range(1, 121):
    im = Image.open(f'{SRC}/vf-{i:03d}.jpg').convert('RGB')
    W, H = im.size
    a = np.asarray(im).astype(int)
    R, G, B = a[..., 0], a[..., 1], a[..., 2]
    gold = (R > 100) & (G > 80) & ((R - B) > 50)
    blue = (B - R > 20) & (B - G >= 20) & (B > 70)
    red = (R > 140) & (G < 70) & (B < 70)
    bg = blue | red
    yy, xx = np.mgrid[0:H, 0:W]
    bg = bg | ((xx / W + yy / H) < 0.62) & ~gold
    bg = bg | ((yy > int(H * 0.88)) & ~gold)
    fg = ~bg
    lab, n = ndimage.label(fg)
    sizes = ndimage.sum(np.ones_like(lab), lab, range(1, n + 1))
    keep = np.zeros_like(fg)
    for j, s in enumerate(sizes, start=1):
        if s >= 5:
            keep[lab == j] = True
    fg = ndimage.binary_closing(keep, structure=np.ones((3, 3)))
    alpha = Image.fromarray((fg * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(1.2))
    out = Image.composite(im, Image.new('RGB', (W, H), (0, 0, 0)), alpha)
    out.save(f'{OUT}/shatter-frame-{i:03d}.jpg', quality=88)
    if i in (1, 30, 60, 90, 120):
        print(i, 'fg px', int(fg.sum()))
print('done')
