const express = require('express');
const router = express.Router();
const webpush = require('web-push');
const Notification = require('../models/Notification');
const { auth, adminAuth } = require('../middleware/auth');

const vapidKeys = webpush.generateVAPIDKeys();

if (process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(
    'mailto:admin@quickpizza.com',
    process.env.VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
  );
}

const subscriptions = new Map();

router.post('/subscribe', auth, async (req, res) => {
  try {
    const { subscription } = req.body;
    if (!subscription) return res.status(400).json({ error: 'No subscription' });

    subscriptions.set(req.user._id.toString(), subscription);
    console.log(`Push subscription saved for user ${req.user._id}`);

    const notif = new Notification({
      user: req.user._id,
      title: 'كويك بيتزا 🍕',
      body: 'تم تفعيل الإشعارات بنجاح! هتتلقى تحديثات عن طلباتك',
      type: 'general'
    });
    await notif.save();

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/subscribe', auth, async (req, res) => {
  subscriptions.delete(req.user._id.toString());
  res.json({ success: true });
});

router.get('/vapid-public-key', (req, res) => {
  res.json({ publicKey: process.env.VAPID_PUBLIC_KEY || vapidKeys.publicKey });
});

router.get('/user-notifications', auth, async (req, res) => {
  try {
    const notifs = await Notification.find({ user: req.user._id })
      .sort('-createdAt')
      .limit(20);
    res.json(notifs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/:id/read', auth, async (req, res) => {
  try {
    await Notification.findByIdAndUpdate(req.params.id, { read: true });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/read-all', auth, async (req, res) => {
  try {
    await Notification.updateMany({ user: req.user._id, read: false }, { read: true });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/unread-count', auth, async (req, res) => {
  try {
    const count = await Notification.countDocuments({ user: req.user._id, read: false });
    res.json({ count });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/send', adminAuth, async (req, res) => {
  try {
    const { userId, title, body, url } = req.body;
    const notif = new Notification({ user: userId, title, body, url, type: 'promo' });
    await notif.save();

    const sub = subscriptions.get(userId.toString());
    if (sub) {
      try {
        await webpush.sendNotification(sub, JSON.stringify({ title, body, icon: '/icons/icon-192.png', url: url || '/' }));
      } catch (e) {
        console.log('Push send failed:', e.message);
        if (e.statusCode === 410) subscriptions.delete(userId.toString());
      }
    }

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
module.exports.sendPushToUser = async function(userId, title, body, url) {
  const notif = new Notification({ user: userId, title, body, url: url || '/', type: 'order' });
  await notif.save();

  const sub = subscriptions.get(userId.toString());
  if (sub) {
    try {
      await webpush.sendNotification(sub, JSON.stringify({ title, body, icon: '/icons/icon-192.png', url: url || '/' }));
    } catch (e) {
      console.log('Push send failed:', e.message);
      if (e.statusCode === 410) subscriptions.delete(userId.toString());
    }
  }
};
