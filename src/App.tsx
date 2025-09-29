import {BarcodeScannerDemoPage} from "./pages/BarcodeScannerDemoPage";
import { InstallPrompt } from "./components/InstallPrompt";
import { UpdatePrompt } from "./components/UpdatePrompt";

function App() {
  return (
    <div className="App">
      <BarcodeScannerDemoPage />
      <InstallPrompt />
      <UpdatePrompt />
    </div>
  );
}

export default App;
