'use client';

type Notification = {
    id: number
    name: string
    message: string
    time: string
    
  }
  
  export default function Notifications() {
    const notifications: Notification[] = [
      {
        id: 1,
        name: "Alex Campbell",
        message: "Just wanted to check in on how everyone's progress...",
        time: "2:36 PM",
      },
      {
        id: 2,
        name: "Mrs. Patel",
        message: "Someone left a blue jacket in the library yesterday...",
        time: "10:32 AM"
      },
      {
        id: 3,
        name: "Coach Daniels",
        message: "Practice canceled today due to weather...",
        time: "7:10 AM",
      },
      {
        id: 4,
        name: "Jamie Lax",
        message: "Study session reminder for tomorrow!...",
        time: "Yesterday, 8:29 PM"
      },
    ]
  
    return (
      <div className="bg-white rounded-lg shadow-sm p-5 h-42">
        <div className="mb-3">
          <h2 className="text-[15px] font-semibold text-gray-800">Notifications</h2>
        </div>
        <div className="space-y-4 mx-2 ">
          {notifications.map((notification) => (
            <div key={notification.id} className="flex items-start space-x-3">
              <div className="flex-grow min-w-0">
                <div className="flex justify-between items-start">
                  <p className="font-medium text-xs">{notification.name}</p>
                  <span className="text-[10px] text-gray-500 whitespace-nowrap ml-2">{notification.time}</span>
                </div>
                <p className="text-[10px] text-gray-500 truncate">{notification.message}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }
  
  