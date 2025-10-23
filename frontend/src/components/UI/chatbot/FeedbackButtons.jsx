import React, { useState } from 'react';

const FeedbackButtons = ({ messageId, onFeedbackSubmit }) => {
  const [feedback, setFeedback] = useState(null);
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);
  const [feedbackText, setFeedbackText] = useState('');

  const handleFeedback = (type) => {
    setFeedback(type);
    if (type === 'negative') {
      setShowFeedbackForm(true);
    } else {
      onFeedbackSubmit(messageId, type, '');
    }
  };

  const submitFeedback = () => {
    onFeedbackSubmit(messageId, feedback, feedbackText);
    setShowFeedbackForm(false);
  };

  // If feedback already submitted, show thank you message
  if (feedback && !showFeedbackForm) {
    return (
      <div className="text-xs text-gray-500 mt-1">
        Thank you for your feedback!
      </div>
    );
  }

  return (
    <>
      {!feedback ? (
        <div className="flex items-center justify-end mt-1 space-x-2">
          <span className="text-xs text-gray-500">Helpful?</span>
          <button
            onClick={() => handleFeedback('positive')}
            className="text-gray-400 hover:text-emerald-500 transition"
            aria-label="Yes, this was helpful"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
            </svg>
          </button>
          <button
            onClick={() => handleFeedback('negative')}
            className="text-gray-400 hover:text-red-500 transition"
            aria-label="No, this was not helpful"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14H5.236a2 2 0 01-1.789-2.894l3.5-7A2 2 0 018.736 3h4.018a2 2 0 01.485.06l3.76.94m-7 10v5a2 2 0 002 2h.096c.5 0 .905-.405.905-.904 0-.715.211-1.413.608-2.008L17 13V4m-7 10h2" />
            </svg>
          </button>
        </div>
      ) : (
        showFeedbackForm && (
          <div className="mt-2">
            <textarea
              value={feedbackText}
              onChange={(e) => setFeedbackText(e.target.value)}
              className="w-full p-2 text-xs border rounded"
              placeholder="How can we improve this response?"
              rows={2}
            />
            <div className="flex justify-end mt-1 space-x-2">
              <button
                onClick={() => setShowFeedbackForm(false)}
                className="text-xs text-gray-500 hover:text-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={submitFeedback}
                className="text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded hover:bg-emerald-200"
              >
                Submit
              </button>
            </div>
          </div>
        )
      )}
    </>
  );
};

export default FeedbackButtons;