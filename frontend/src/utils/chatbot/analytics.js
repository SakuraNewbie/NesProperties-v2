import { api } from '../../api';

// Enhanced analytics with ML-ready data collection
const analytics = {
  events: [],
  sessionId: null,
  analyticsFailed: 0,
  
  // Initialize analytics with unique session ID
  init() {
    this.sessionId = localStorage.getItem('chatbot_session_id') || this._generateSessionId();
    localStorage.setItem('chatbot_session_id', this.sessionId);
    this._loadEvents();
    
    // Track session start
    this.trackEvent('session_start', { 
      referrer: document.referrer,
      userAgent: navigator.userAgent,
      screenSize: `${window.innerWidth}x${window.innerHeight}`,
      platform: navigator.platform
    });
    
    return this;
  },
  
  // Generate session ID
  _generateSessionId() {
    return 'xxxx-xxxx-xxxx-xxxx'.replace(/[x]/g, () => {
      return Math.floor(Math.random() * 16).toString(16);
    });
  },
  
  // Track message sent by user
  trackMessage(message) {
    return this.trackEvent('message_sent', { message });
  },
  
  // Track property click
  trackPropertyClick(propertyId) {
    return this.trackEvent('property_clicked', { propertyId });
  },
  
  // Enhanced event tracking with session ID and more metadata
  trackEvent(eventType, eventData = {}) {
    const event = {
      type: eventType,
      sessionId: this.sessionId,
      timestamp: new Date().toISOString(),
      url: window.location.href,
      ...eventData
    };
    
    this.events.push(event);
    this._saveEvents();
    
    // Send to backend if available
    this._sendToBackend(event);
    
    return event;
  },
  
  // Send analytics event to backend - FIX HERE
  _sendToBackend(event) {
    // If we've had multiple failures, stop trying for this session
    if (this.analyticsFailed > 3) return;
    
    try {
      // Use the full API URL instead of a relative path
      const analyticsUrl = `${api.baseUrl}/chatbot/analytics`;
      
      // Use a beacon for reliability when page might be unloading
      if (navigator.sendBeacon) {
        const blob = new Blob([JSON.stringify(event)], { type: 'application/json' });
        navigator.sendBeacon(analyticsUrl, blob);
      } else {
        // Fallback to fetch for older browsers
        fetch(analyticsUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(event),
          keepalive: true // Try to keep request alive even if page unloads
        }).catch(e => console.warn('Analytics send failed:', e));
      }
    } catch (e) {
      console.warn('Failed to send analytics:', e);
      this.analyticsFailed = (this.analyticsFailed || 0) + 1;
    }
  },
  
  // Load saved events from localStorage
  _loadEvents() {
    try {
      const saved = localStorage.getItem('chatbot_analytics');
      if (saved) {
        this.events = JSON.parse(saved);
      }
    } catch (e) {
      console.error('Failed to load analytics data:', e);
    }
  },
  
  // Save events to localStorage
  _saveEvents() {
    try {
      // Only keep the last 100 events to avoid localStorage limits
      const eventsToSave = this.events.slice(-100);
      localStorage.setItem('chatbot_analytics', JSON.stringify(eventsToSave));
    } catch (e) {
      console.error('Failed to save analytics data:', e);
    }
  },
  
  // Track feedback
  trackFeedback(messageId, feedbackType, feedbackText) {
    return this.trackEvent('feedback', { messageId, feedbackType, feedbackText });
  }
};

export default analytics.init();