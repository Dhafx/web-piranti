import { useEffect } from "react";
import { useFetch } from "./hooks/useFetch";
import io from "socket.io-client";

const socket = io("http://localhost:3000");

const App = () => {
  const { data, loading, error } = useFetch("http://localhost:3000/api/movement");

  useEffect(() => {
    // Mendengarkan pembaruan data dari server
    socket.on("data-update", (data) => {
      console.log("Received data update:", data);
      // Lakukan sesuatu dengan data yang diterima, misalnya update state
    });

    return () => {
      // Membersihkan koneksi saat komponen unmount
      socket.disconnect();
    };
  }, []);

  return (
    <div className="bg-red-400 h-screen flex justify-center items-center">
      <div className="bg-yellow-400">
        {data.map((item) => {
          return (
            <div key={item.id}>
              <span className="font-bold">id: </span>
              <span>{item.id}, </span>
              <span className="font-bold">x: </span>
              <span>{item.x_value}, </span>
              <span className="font-bold">y: </span>
              <span>{item.y_value}, </span>
              <span className="font-bold">z: </span>
              <span>{item.z_value}, </span>
              <span className="font-bold">angle: </span> <span>{item.angle}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default App;
