import "./App.css";
import { mockEvents } from "./components/mockEvents";
import WorkingCalendar from "./components/WorkingCalendar";

function App() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "32px 16px",
      }}
    >
      <WorkingCalendar
        legend="Team calendar"
        events={mockEvents}
        maxVisibleEvents={3}
        onAddClick={(date) => console.log("add on", date)}
        onOverflowClick={(date, hidden) =>
          console.log("overflow on", date, hidden)
        }
      />
    </div>
  );
}

export default App;
