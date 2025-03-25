import Header from "../components/Header";
import NavBar from "../components/NavBar";
import "../stylesheets/TicketPage.css";

const TicketPage = () => {
    return (
        <div className="ticketpage-container">
        <Header />
        <NavBar />
        <div className="ticket-page-content">
            <h1>Ticket Page</h1>
        </div>
        </div>
    );
}

export default TicketPage;