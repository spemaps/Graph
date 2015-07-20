# Graph
To turn pictures into graphs.


Notes for future improvement 14/7/2015

-change ids in html to match node attribute names in js. Allow for efficiency when updating.
-much of the update code exists to control the showing/hiding of elements in the update box. Something broke that no longer allows for showing/hiding. This code is obsolete and taking up space. We should delete it (save it in another version) or fix it, and I favor deleting it.

20/7/2015
resolve minor issues with regionDetection (currently line 1512).
Just need to delete location out of [closest, location, object] (as it is defunct)
Will need to go through all functions that call on regionDetection and make sure they call on the item 1 in the array instead of item 2 (so that they continue to call object)

ib
