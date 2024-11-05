import React, { useState } from "react";
import { ChevronDownIcon } from "@heroicons/react/24/solid";
import { Button } from "@material-tailwind/react";


export default function Delete({onClickk}) {

  const [isOpen, setIsOpen] = useState(false);

  return(
    <div>
      <Button variant="text" className="py-2.5 px-2.5"
      onClick={() =>setIsOpen(!isOpen)}>
        <ChevronDownIcon strokeWidth={2} className="w-5 text-white " />
      </Button>
      {isOpen && (
        <React.Fragment>
          <div className="bg-white shadow-md rounded-md absolute right-0 mt-1 mr-2">
            <div className="p-2">
              {/* <p className="text-gray-700">Delete</p> */}
              <button onClick={onClickk}>Delete</button>
            </div>
            <div className="p-2">
              {/* <p className="text-gray-700">Cancel</p> */}
              <button onClick={() => setIsOpen(false)}>Cancel</button>
            </div>
          </div>
        </React.Fragment>
      )}
    </div>
  )
}