import React, { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
// Temporarily remove this import until we install the package
// import { FaPaperPlane, FaMicrophone, FaPaperclip, FaSmile, FaTimes, FaSquare } from 'react-icons/fa';
import './ChatInput.css';

const ChatInput = ({
  onSendMessage,
  replyTo,
  onCancelReply,
  placeholder = 'Type a message'
}) => {
  const [message, setMessage] = useState('');
  const [attachments, setAttachments] = useState([]);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  
  const textAreaRef = useRef(null);
  const fileInputRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const recordingTimerRef = useRef(null);
  const inputActionsRef = useRef(null);
  
  // Auto-resize text area
  useEffect(() => {
    if (textAreaRef.current) {
      textAreaRef.current.style.height = 'auto';
      textAreaRef.current.style.height = `${Math.min(textAreaRef.current.scrollHeight, 120)}px`;
    }
  }, [message]);
  
  // Clean up recording on unmount
  useEffect(() => {
    return () => {
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
      }
      if (mediaRecorderRef.current && isRecording) {
        mediaRecorderRef.current.stop();
      }
    };
  }, [isRecording]);
  
  // Close emoji picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showEmojiPicker && inputActionsRef.current && !inputActionsRef.current.contains(event.target)) {
        setShowEmojiPicker(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showEmojiPicker]);
  
  const handleMessageChange = (e) => {
    setMessage(e.target.value);
  };
  
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };
  
  const handleSendMessage = () => {
    if (message.trim() || attachments.length > 0) {
      onSendMessage(message, attachments, replyTo);
      setMessage('');
      setAttachments([]);
      setShowEmojiPicker(false);
    }
  };
  
  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      const newAttachments = files.map(file => ({
        file,
        preview: URL.createObjectURL(file),
        type: file.type,
        name: file.name,
        size: file.size
      }));
      
      setAttachments(prev => [...prev, ...newAttachments]);
      
      // Reset file input to allow selecting the same file again
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };
  
  const removeAttachment = (index) => {
    setAttachments(prev => {
      const newAttachments = [...prev];
      // Revoke the object URL to prevent memory leaks
      URL.revokeObjectURL(newAttachments[index].preview);
      newAttachments.splice(index, 1);
      return newAttachments;
    });
  };
  
  const handleEmojiClick = (emoji) => {
    setMessage(prev => prev + emoji);
    textAreaRef.current?.focus();
  };
  
  const toggleEmojiPicker = () => {
    setShowEmojiPicker(prev => !prev);
  };
  
  const toggleRecording = async () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };
  
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];
      
      mediaRecorderRef.current.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };
      
      mediaRecorderRef.current.onstop = () => {
        // Create audio blob and handle the recorded audio
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const audioUrl = URL.createObjectURL(audioBlob);
        
        // Create a File object from the Blob
        const audioFile = new File([audioBlob], `voice-message-${Date.now()}.webm`, { 
          type: 'audio/webm' 
        });
        
        // Add as an attachment
        const newAttachment = {
          file: audioFile,
          preview: audioUrl,
          type: 'audio/webm',
          name: audioFile.name,
          size: audioFile.size
        };
        
        setAttachments(prev => [...prev, newAttachment]);
        
        // Stop all tracks in the stream
        stream.getTracks().forEach(track => track.stop());
        
        // Reset recording state
        setIsRecording(false);
        setRecordingTime(0);
        clearInterval(recordingTimerRef.current);
        recordingTimerRef.current = null;
      };
      
      // Start recording
      mediaRecorderRef.current.start();
      setIsRecording(true);
      
      // Start timer
      recordingTimerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
      
    } catch (error) {
      console.error('Error starting recording:', error);
      alert('Could not access microphone. Please check your permissions.');
    }
  };
  
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
    }
  };
  
  const formatRecordingTime = (seconds) => {
    const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
    const secs = (seconds % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
  };
  
  // Format file size
  const formatFileSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };
  
  // Render attachment preview based on file type
  const renderAttachmentPreview = (attachment, index) => {
    const { type, preview, name, size } = attachment;
    
    if (type.startsWith('image/')) {
      return (
        <div className="attachment-item" key={index}>
          <img 
            src={preview} 
            alt={name} 
            className="attachment-preview" 
          />
          <div className="attachment-info">
            <span className="attachment-name">{name}</span>
            <span className="attachment-size">{formatFileSize(size)}</span>
          </div>
          <button 
            className="remove-attachment" 
            onClick={() => removeAttachment(index)}
          >
            &times;
          </button>
        </div>
      );
    } else if (type.startsWith('audio/')) {
      return (
        <div className="attachment-item" key={index}>
          <div className="attachment-icon">
            🎤
          </div>
          <div className="attachment-info">
            <span className="attachment-name">Voice Message</span>
            <span className="attachment-size">{formatFileSize(size)}</span>
          </div>
          <button 
            className="remove-attachment" 
            onClick={() => removeAttachment(index)}
          >
            &times;
          </button>
        </div>
      );
    } else if (type.startsWith('video/')) {
      return (
        <div className="attachment-item" key={index}>
          <video 
            src={preview} 
            className="attachment-preview" 
          />
          <div className="attachment-info">
            <span className="attachment-name">{name}</span>
            <span className="attachment-size">{formatFileSize(size)}</span>
          </div>
          <button 
            className="remove-attachment" 
            onClick={() => removeAttachment(index)}
          >
            &times;
          </button>
        </div>
      );
    } else {
      return (
        <div className="attachment-item" key={index}>
          <div className="attachment-icon">
            📎
          </div>
          <div className="attachment-info">
            <span className="attachment-name">{name}</span>
            <span className="attachment-size">{formatFileSize(size)}</span>
          </div>
          <button 
            className="remove-attachment" 
            onClick={() => removeAttachment(index)}
          >
            &times;
          </button>
        </div>
      );
    }
  };
  
  // Popular emojis for the picker
  const emojis = [
    '😊', '😂', '❤️', '👍', '🎉', '🔥', '😎', '🙏', '👋', 
    '🤔', '😢', '😍', '👏', '🌟', '😴', '🥳', '😀', '😁', 
    '😆', '😅', '😄', '🤣', '😇', '😉', '😋'
  ];
  
  return (
    <div className="chat-input-container">
      {/* Reply preview */}
      {replyTo && (
        <div className="reply-preview">
          <div className="reply-content">
            <span className="reply-to">Replying to {replyTo.sender?.username || 'message'}</span>
            <p className="reply-text">{replyTo.content || 'Attachment'}</p>
          </div>
          <button className="cancel-reply" onClick={onCancelReply}>
            &times;
          </button>
        </div>
      )}
      
      {/* Attachments preview */}
      {attachments.length > 0 && (
        <div className="attachments-preview">
          {attachments.map((attachment, index) => 
            renderAttachmentPreview(attachment, index)
          )}
        </div>
      )}
      
      <div className="input-wrapper">
        {/* Emoji picker button */}
        <div 
          ref={inputActionsRef} 
          className="input-action-left"
        >
          <button 
            className="emoji-button"
            onClick={toggleEmojiPicker}
            disabled={isRecording}
          >
            😊
          </button>
          
          {/* Emoji picker */}
          {showEmojiPicker && (
            <div className="emoji-picker">
              {emojis.map((emoji, index) => (
                <button 
                  key={index} 
                  className="emoji-option"
                  onClick={() => handleEmojiClick(emoji)}
                >
                  {emoji}
                </button>
              ))}
            </div>
          )}
        </div>
        
        {/* Attachment button */}
        <div className="input-action-left">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            multiple
            accept="image/*,video/*,audio/*,application/*"
            style={{ display: 'none' }}
          />
          
          <button 
            className="attachment-button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isRecording}
          >
            📎
          </button>
        </div>
        
        {/* Text input */}
        <div className="message-input">
          <textarea
            ref={textAreaRef}
            value={message}
            onChange={handleMessageChange}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            rows={1}
            disabled={isRecording}
          />
        </div>
        
        {/* Send/Record button */}
        <div className="input-action-right">
          {message.trim() || attachments.length > 0 ? (
            <button 
              className="send-button"
              onClick={handleSendMessage}
            >
              📤
            </button>
          ) : (
            <button 
              className={`record-button ${isRecording ? 'recording' : ''}`}
              onClick={toggleRecording}
            >
              {isRecording ? (
                <>
                  ⏹️
                  <span className="recording-time">{formatRecordingTime(recordingTime)}</span>
                </>
              ) : (
                '🎤'
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

ChatInput.propTypes = {
  onSendMessage: PropTypes.func.isRequired,
  replyTo: PropTypes.object,
  onCancelReply: PropTypes.func,
  placeholder: PropTypes.string
};

export default ChatInput; 