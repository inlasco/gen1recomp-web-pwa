# Physical acceptance gate

Do not merge or deploy this candidate solely on static checks.

Required physical validation in inlasComp Web/PWA:

1. Gold: import mod, enable, overworld voxel, transition, wild/trainer battle, return to overworld.
2. Silver: same sequence.
3. Crystal: same sequence, with Chris/Kris paths where practical.
4. Safari/iPhone: portrait/landscape transition, touch input alignment, no black frame, no native LÖVE abort, no persistent audio degradation.
5. Disable mod: native Gen2 2D rendering must return unchanged.

A failure on Crystal must not be hidden by claiming generic Gen2 compatibility; Crystal acceptance is separate from Gold/Silver upstream evidence.
