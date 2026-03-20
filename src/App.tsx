import "./App.css";
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
        onAddClick={(date) => {
          console.log(date);
        }}
      />
    </div>
  );
}

export default App;
