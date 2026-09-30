import React, { useState } from "react";
import "./HelpSupport.css";

const HelpSupport = () => {
    const [openFaq, setOpenFaq] = useState(null);

    const toggleFaq = (index) => {
        setOpenFaq(openFaq === index ? null : index);
    };

    const faqs = [
        {
            question: "How does the student performance prediction work?",
            answer:
                "The system uses your academic information such as attendance, internal marks, midterm marks, assignment completion, study hours, and previous semester SGPA to predict your expected performance."
        },
        {
            question: "How can I make a performance prediction?",
            answer:
                "Go to the AI Prediction page, enter your academic information, select the subject, and click the prediction button. The system will generate your predicted marks and performance category."
        },
        {
            question: "Where can I see my previous predictions?",
            answer:
                "Open the Prediction History page from the sidebar. You can view your previous predictions and the academic information used for them."
        },
        {
            question: "How do AI study recommendations work?",
            answer:
                "The system uses your academic and study information to provide personalized recommendations such as study hours, study methods, preferred study time, and areas that need improvement."
        },
        {
            question: "What should I do if my prediction is incorrect?",
            answer:
                "Make sure that the academic information you entered is accurate. You can create a new prediction using your latest academic information."
        },
        {
            question: "Why can't I see my data?",
            answer:
                "Make sure you are logged in with the correct account and that your academic information has been saved. If the problem continues, contact support."
        }
    ];

    return (
        <div className="help-support-page">

            {/* Header */}
            <div className="help-header">
                <div>
                    <h1>Help & Support</h1>
                    <p>
                        Find answers, learn how to use the system,
                        and get help with common problems.
                    </p>
                </div>

                <div className="help-header-icon">
                    ?
                </div>
            </div>

            {/* Support Cards */}
            <div className="support-cards">

                <div className="support-card">
                    <div className="support-icon">📚</div>
                    <h3>Getting Started</h3>
                    <p>
                        Learn how to use the Student Performance
                        Prediction System.
                    </p>
                    <a href="#getting-started">Learn More →</a>
                </div>

                <div className="support-card">
                    <div className="support-icon">🤖</div>
                    <h3>AI Prediction</h3>
                    <p>
                        Understand how performance predictions
                        and recommendations work.
                    </p>
                    <a href="#ai-help">Learn More →</a>
                </div>

                <div className="support-card">
                    <div className="support-icon">🛠️</div>
                    <h3>Technical Support</h3>
                    <p>
                        Having trouble with the application?
                        Check the common solutions below.
                    </p>
                    <a href="#technical-help">Get Help →</a>
                </div>

            </div>

            {/* Getting Started */}
            <section className="help-section" id="getting-started">
                <div className="section-title">
                    <span>📖</span>
                    <div>
                        <h2>Getting Started</h2>
                        <p>Follow these steps to use the system.</p>
                    </div>
                </div>

                <div className="steps-container">

                    <div className="help-step">
                        <span className="step-number">1</span>
                        <div>
                            <h3>Complete your profile</h3>
                            <p>
                                Add your student information and make sure
                                your profile details are correct.
                            </p>
                        </div>
                    </div>

                    <div className="help-step">
                        <span className="step-number">2</span>
                        <div>
                            <h3>Enter academic data</h3>
                            <p>
                                Add your attendance, marks, assignments,
                                study hours, and other academic information.
                            </p>
                        </div>
                    </div>

                    <div className="help-step">
                        <span className="step-number">3</span>
                        <div>
                            <h3>Generate a prediction</h3>
                            <p>
                                Open AI Prediction and submit your academic
                                information to generate a prediction.
                            </p>
                        </div>
                    </div>

                    <div className="help-step">
                        <span className="step-number">4</span>
                        <div>
                            <h3>Follow recommendations</h3>
                            <p>
                                Check your AI recommendations and use them
                                to improve your study routine.
                            </p>
                        </div>
                    </div>

                </div>
            </section>

            {/* AI Help */}
            <section className="help-section" id="ai-help">
                <div className="section-title">
                    <span>🤖</span>
                    <div>
                        <h2>AI Prediction & Recommendations</h2>
                        <p>Understand the AI features.</p>
                    </div>
                </div>

                <div className="info-box">
                    <h3>What information is used?</h3>

                    <div className="info-grid">
                        <div>📊 Attendance</div>
                        <div>📝 Internal Marks</div>
                        <div>📋 Midterm Marks</div>
                        <div>📚 Assignment Completion</div>
                        <div>⏱️ Study Hours</div>
                        <div>🎓 Previous SGPA</div>
                    </div>
                </div>
            </section>

            {/* FAQ */}
            <section className="help-section">
                <div className="section-title">
                    <span>❓</span>
                    <div>
                        <h2>Frequently Asked Questions</h2>
                        <p>Quick answers to common questions.</p>
                    </div>
                </div>

                <div className="faq-container">
                    {faqs.map((faq, index) => (
                        <div
                            className={`faq-item ${
                                openFaq === index ? "faq-open" : ""
                            }`}
                            key={index}
                        >
                            <button
                                className="faq-question"
                                onClick={() => toggleFaq(index)}
                            >
                                <span>{faq.question}</span>
                                <span className="faq-arrow">
                                    {openFaq === index ? "−" : "+"}
                                </span>
                            </button>

                            {openFaq === index && (
                                <div className="faq-answer">
                                    {faq.answer}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </section>

            {/* Technical Help */}
            <section
                className="help-section"
                id="technical-help"
            >
                <div className="section-title">
                    <span>🛠️</span>
                    <div>
                        <h2>Technical Support</h2>
                        <p>Try these solutions for common problems.</p>
                    </div>
                </div>

                <div className="technical-grid">

                    <div className="technical-card">
                        <h3>Page is not loading</h3>
                        <p>
                            Refresh the page and check your internet
                            connection. If the problem continues,
                            log out and log in again.
                        </p>
                    </div>

                    <div className="technical-card">
                        <h3>Prediction is not generated</h3>
                        <p>
                            Check that all required academic fields
                            are completed correctly before submitting.
                        </p>
                    </div>

                    <div className="technical-card">
                        <h3>Login problem</h3>
                        <p>
                            Check your username and password. If you
                            still cannot log in, contact your administrator.
                        </p>
                    </div>

                </div>
            </section>

            {/* Contact Support */}
            <section className="contact-support">
                <div>
                    <h2>Still need help?</h2>
                    <p>
                        If you cannot find the answer here, contact
                        your administrator or project support team.
                    </p>
                </div>

                <button
                    onClick={() =>
                        window.location.href =
                            "mailto:support@studentperformance.com"
                    }
                >
                    Contact Support
                </button>
            </section>

        </div>
    );
};

export default HelpSupport;