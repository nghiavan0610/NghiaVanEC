import { Button, useToast } from "@chakra-ui/react";
import React, { useEffect, useState } from "react";
import { IoAdd } from "react-icons/io5";
import { useDispatch, useSelector } from "react-redux";
import note from "../../images/add-notes.svg";
import Table from "../Table";
import { getMaterials } from "../../features/materialSlice";
import Spinner from "../Spinner";
import { v4 as uuidv4 } from 'uuid';

function TotalsPanel({ detail, isManager, isLeader, isMember }) {

  const [data, setData] = useState(detail.updatedSummary);
  const { role, _id } = useSelector((state) => state.user.auth);
  const { materials, isLoading } = useSelector((state) => state.material);

  const dispatch = useDispatch();

  useEffect(() => {
    if (materials.length === 0)
      dispatch(getMaterials());
  }, []);

  useEffect(() => {
    setData(detail.updatedSummary);
  }, [detail.updatedSummary]);

  const addSample = () => {
    // let _data = {
    //   "isOriginal": true,
    //   "routes": []
    // };
    let _data = {
      "isOriginal": true,
      "routes": [
        {
          "name": "Tuyến: A",
          "_id": uuidv4(),
          "isNew": true,
          "stations": [
            {
              "name": " Nhánh: a",
              "_id": uuidv4(),
              "isNew": true,
              "pillars": [
                {
                  "name": "1",
                  "_id": uuidv4(),
                  "isNew": true,
                }
              ]
            }
          ]
        }
      ]
    }
    setData(_data);
  };

  return (
    <>
      {data ? (
        materials.length === 0 ? <Spinner /> :
          <Table _orig={detail.originalSummary} _data={data} slug={detail.slug} allMaterials={materials} />
      ) : (
        <div className="py-8 flex flex-col justify-center items-center">
          <img src={note} alt="note" className="w-5/12 h-56" />
          <p className="mt-10 mb-5 text-xl font-semibold">Chưa có dữ liệu</p>
          {(isManager || isLeader || role === "admin") && <Button
            as="label"
            htmlFor="file"
            leftIcon={<IoAdd color="#fff" />}
            background="primary"
            color="white"
            variant="solid"
            onClick={addSample}
          >
            Tạo bản tổng kê gốc
          </Button>}
        </div>
      )}
    </>
  );
}

export default TotalsPanel;
