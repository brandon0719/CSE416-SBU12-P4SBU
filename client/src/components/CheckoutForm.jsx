import React, { useState } from "react";
import { useStripe, useElements, CardElement } from "@stripe/react-stripe-js";
import "../stylesheets/CheckoutForm.css";

export default function CheckoutForm({
    clientSecret,
    rate, // dollars per hour
    hours, 
    onSuccessfulPayment,
    onCancel,
}) {
    const stripe = useStripe();
    const elements = useElements();
    const [errorMsg, setErrorMsg] = useState(null);
    const [processing, setProcessing] = useState(false);

    // compute total cost
    const total = rate * hours;

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!stripe || !elements) return;

        setProcessing(true);
        setErrorMsg(null);

        const { error, paymentIntent } = await stripe.confirmCardPayment(
            clientSecret,
            {
                payment_method: {
                    card: elements.getElement(CardElement),
                },
            }
        );

        setProcessing(false);
        if (error) {
            setErrorMsg(error.message);
        } else if (paymentIntent?.status === "succeeded") {
            onSuccessfulPayment();
        }
    };

    return (
        <form className="checkout-form" onSubmit={handleSubmit}>
            {/* breakdown */}
            <div className="checkout-amount">
                <div>
                    Rate: <strong>${parseFloat(rate).toFixed(2)}/hr</strong>
                </div>
                <div>
                    Duration: <strong>{parseFloat(hours).toFixed(2)} hrs</strong>
                </div>
                <div>
                    Total: <strong>${parseFloat(total).toFixed(2)}</strong>
                </div>
            </div>

            <CardElement
                options={{
                    style: {
                        base: {
                            fontSize: "16px",
                            color: "#424770",
                            "::placeholder": { color: "#aab7c4" },
                        },
                        invalid: { color: "#9e2146" },
                    },
                }}
                className="stripe-element"
            />

            {errorMsg && <div className="error-message">{errorMsg}</div>}

            <div className="button-group">
                <button
                    type="submit"
                    className="checkout-submit-btn"
                    disabled={!stripe || processing}>
                    {processing ? "Processing…" : `Pay $${total.toFixed(2)}`}
                </button>
                <button
                    type="button"
                    className="checkout-cancel-btn"
                    onClick={onCancel}
                    disabled={processing}>
                    Cancel
                </button>
            </div>
        </form>
    );
}
