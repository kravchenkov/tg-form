import React, { useState } from 'react';
import './GlassForm.css';

function GlassForm() {
  const [formData, setFormData] = useState({
    name: '',
    surname: '',
    number: '',
    email: ''
  });

  const [errors, setErrors] = useState({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const botToken = import.meta.env.VITE_TELEGRAM_BOT_TOKEN;
  const chatId = import.meta.env.VITE_TELEGRAM_CHAT_ID;
  const isTelegramConfigured = botToken && 
    chatId && 
    botToken !== 'YOUR_BOT_TOKEN_HERE' && 
    chatId !== 'YOUR_CHAT_ID_HERE';

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
    // Clear validation error on change
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.surname.trim()) newErrors.surname = 'Surname is required';
    
    // Simple phone number validation (at least 7 digits)
    const phoneRegex = /^[+]?[0-9\s\-()]{7,20}$/;
    if (!formData.number.trim()) {
      newErrors.number = 'Phone number is required';
    } else if (!phoneRegex.test(formData.number.trim())) {
      newErrors.number = 'Invalid phone number format';
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!emailRegex.test(formData.email.trim())) {
      newErrors.email = 'Invalid email address';
    }



    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');
    if (validate()) {
      setIsSubmitting(true);

      if (!isTelegramConfigured) {
        // Fallback for visual demo when credentials are not filled yet
        setTimeout(() => {
          setIsSubmitting(false);
          setIsSubmitted(true);
        }, 1200);
        return;
      }

      const messageText = `📝 *New Form Registration* \n\n` +
                          `👤 *Name:* ${formData.name}\n` +
                          `👥 *Surname:* ${formData.surname}\n` +
                          `📞 *Phone:* ${formData.number}\n` +
                          `📧 *Email:* ${formData.email}`;

      try {
        const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            chat_id: chatId,
            text: messageText,
            parse_mode: 'Markdown',
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.description || 'Failed to dispatch message to Telegram');
        }

        setIsSubmitting(false);
        setIsSubmitted(true);
      } catch (error) {
        console.error('Telegram dispatch error:', error);
        setSubmitError(error.message || 'Failed to send details to the Telegram bot. Please check your credentials or internet connection.');
        setIsSubmitting(false);
      }
    }
  };

  const handleReset = () => {
    setFormData({
      name: '',
      surname: '',
      number: '',
      email: ''
    });
    setErrors({});
    setIsSubmitted(false);
  };

  if (isSubmitted) {
    return (
      <div className="glass-card success-card animate-fade-in">
        <div className="success-icon-wrapper">
          <svg className="success-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2>Registration Successful!</h2>
        <p className="success-message">
          Thank you, <strong>{formData.name}</strong>. 
          {isTelegramConfigured 
            ? ' Your details have been sent directly to the Telegram bot!'
            : ' Your details have been recorded (Telegram bot unconfigured).'}
        </p>
        
        <div className="submitted-data-summary">
          <div className="summary-row"><span>Full Name</span><strong>{formData.name} {formData.surname}</strong></div>
          <div className="summary-row"><span>Phone</span><strong>{formData.number}</strong></div>
          <div className="summary-row"><span>Email</span><strong>{formData.email}</strong></div>
        </div>

        <button type="button" className="glass-btn btn-primary" onClick={handleReset}>
          Submit Another Response
        </button>
      </div>
    );
  }

  return (
    <div className="glass-form-container">
      {/* Ambient background glows that move/interact to demonstrate glassmorphism */}
      <div className="glow-blob blob-1"></div>
      <div className="glow-blob blob-2"></div>
      <div className="glow-blob blob-3"></div>

      <div className="glass-card form-card animate-fade-in">
        {!isTelegramConfigured && (
          <div className="telegram-status-banner warning">
            <strong>⚠️ Telegram Bot Connection Pending</strong>
            <p>Please configure your <code>.env</code> file with valid Telegram credentials. Currently submitting in demo-only mode.</p>
          </div>
        )}

        {isTelegramConfigured && (
          <div className="telegram-status-banner success">
            <strong>🔌 Connected to Telegram Bot</strong>
            <p>Submissions will be dispatched in real-time to your Telegram channel.</p>
          </div>
        )}

        {submitError && (
          <div className="telegram-status-banner error animate-fade-in">
            <strong>❌ Dispatch Failed</strong>
            <p>{submitError}</p>
          </div>
        )}

        <div className="glass-card-header">
          <h2>Registration Details</h2>
          <p>Please fill out the information below to continue</p>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-row-2">
            <div className={`form-group ${errors.name ? 'has-error' : ''}`}>
              <label htmlFor="name">Name</label>
              <div className="input-wrapper">
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="John"
                  required
                />
              </div>
              {errors.name && <span className="error-text" role="alert">{errors.name}</span>}
            </div>

            <div className={`form-group ${errors.surname ? 'has-error' : ''}`}>
              <label htmlFor="surname">Surname</label>
              <div className="input-wrapper">
                <input
                  type="text"
                  id="surname"
                  name="surname"
                  value={formData.surname}
                  onChange={handleChange}
                  placeholder="Doe"
                  required
                />
              </div>
              {errors.surname && <span className="error-text" role="alert">{errors.surname}</span>}
            </div>
          </div>

          <div className="form-row-2">
            <div className={`form-group ${errors.number ? 'has-error' : ''}`}>
              <label htmlFor="number">Phone Number</label>
              <div className="input-wrapper">
                <input
                  type="tel"
                  id="number"
                  name="number"
                  value={formData.number}
                  onChange={handleChange}
                  placeholder="+1 (555) 019-2834"
                  required
                />
              </div>
              {errors.number && <span className="error-text" role="alert">{errors.number}</span>}
            </div>

            <div className={`form-group ${errors.email ? 'has-error' : ''}`}>
              <label htmlFor="email">Email Address</label>
              <div className="input-wrapper">
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="john.doe@example.com"
                  required
                />
              </div>
              {errors.email && <span className="error-text" role="alert">{errors.email}</span>}
            </div>
          </div>



          <button
            type="submit"
            className={`glass-btn btn-primary ${isSubmitting ? 'submitting' : ''}`}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <span className="btn-spinner-container">
                <span className="btn-spinner"></span>
                Sending to Telegram...
              </span>
            ) : (
              isTelegramConfigured ? 'Submit to Telegram' : 'Submit to Telegram'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

export default GlassForm;
