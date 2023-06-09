
import React, { useEffect, useState } from 'react';
import { Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, useDisclosure, Button, Popover, PopoverTrigger, PopoverContent, PopoverArrow, PopoverBody, FormControl, FormLabel, Input, PopoverFooter, ButtonGroup, Box, ModalCloseButton, Flex, ModalFooter, IconButton, PopoverCloseButton, PopoverHeader, Checkbox } from '@chakra-ui/react';
import DocViewer, { DocViewerRenderers } from "@jomari-wp/react-doc-viewer";
import { useForm } from 'react-hook-form';
import { useDispatch } from "react-redux";
import { leaveMembers, removeFileFromTimesheet, reviewTimesheet } from '../../features/project/projectSlice';
import 'react-reflex/styles.css';
import TimesheetFileUpload from './TimesheetFileUpload';

import { MdRule, MdEditNote, MdInsertDriveFile, MdCheck, MdClose } from 'react-icons/md';
import { IoTrash } from 'react-icons/io5';

import file_upload from "../../images/file_upload.svg";

const TimesheetViewFile = ({ children, timesheetDetail, slug, members, isManager, isLeader, isMember, isAdmin }) => {
  const [selected, setSelected] = useState(null);

  const { isOpen, onOpen, onClose } = useDisclosure();
  const dispatch = useDispatch();
  const { isOpen: isOpenPopoverApprove, onOpen: onOpenPopoverApprove, onClose: onClosePopoverApprove } = useDisclosure();
  const { isOpen: isOpenPopoverComment, onOpen: onOpenPopoverComment, onClose: onClosePopoverComment } = useDisclosure();

  const workDate = timesheetDetail.workDate;

  const childrenWithProps = React.Children.map(children, (child) => {
    if (React.isValidElement(child)) {
      return React.cloneElement(child, { onClick: onOpen });
    }
    return child;
  });

  useEffect(() => {
    if (!selected)
      setSelected(timesheetDetail?.proofs && timesheetDetail.proofs[0]);
  }, [timesheetDetail])

  const {
    handleSubmit,
    register,
    control,
    reset,
    formState: { errors },
  } = useForm();

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleComment = async (formData) => {
    const data = {
      ...formData,
      timesheetId: timesheetDetail.timesheet,
      shift: timesheetDetail.shift,
      workDate: workDate
    };
    await dispatch(reviewTimesheet({ data, slug }))
    onClosePopoverComment();
  };

  const handleApprove = async () => {
    const data = {
      timesheetId: timesheetDetail.timesheet,
      isApproved: true,
      proofId: selected._id,
      workDate: workDate,
      shift: timesheetDetail.shift,
      comment: timesheetDetail.comment
    };
    await dispatch(reviewTimesheet({ data, slug }))
    onClosePopoverApprove();
  };

  const handleDecline = async () => {
    const data = {
      timesheetId: timesheetDetail.timesheet,
      isApproved: false,
      proofId: selected._id,
      workDate: workDate,
      shift: timesheetDetail.shift,
      comment: timesheetDetail.comment
    };
    await dispatch(reviewTimesheet({ data, slug }))
    onClosePopoverApprove();
  };

  const timestamp = new Date(timesheetDetail.updatedAt);
  const formattedTimestamp = timestamp.toLocaleString("vi-VN", {
    hour12: false, hour: "2-digit", minute: "2-digit", second: "2-digit", day: "2-digit", month: "2-digit", year: "numeric",
  });

  const formattedWorkDate = new Date(workDate).toLocaleString("vi-VN", {
    day: "2-digit", month: "2-digit", year: "numeric",
  });

  return (
    <>
      {/* Button */}
      {childrenWithProps}
      <Modal isOpen={isOpen} onClose={handleClose} size={'full'}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader className='flex justify-between items-center'>
            <div className='flex flex-col justify-between -mb-2 align-left'>
              <div><span className='font-bold text-lg'>Ngày: </span> <span className='font-normal text-lg'>{`${formattedWorkDate} (ca ${timesheetDetail.shift === 'morning' ? 'sáng' : timesheetDetail.shift === 'evening' ? 'chiều' : 'tối'})`}</span></div>
              <div><span className='font-bold text-lg'>Ghi chú: </span> <span className='font-normal text-lg'>{`${timesheetDetail?.comment ?? "Không có"}`}</span></div>
              <div className='-mt-2'>
                <span className='font-normal text-xs'>{`Cập nhật lúc ${formattedTimestamp}`}</span>
              </div>
            </div>
            <div className='mt-6 flex'>
              <TimesheetFileUpload _workDate={workDate} _shift={timesheetDetail.shift} timesheetId={timesheetDetail.timesheet} slug={slug}>
                <Button
                  className='mr-2'
                  leftIcon={<MdInsertDriveFile />}
                >
                  Thêm tệp
                </Button>
              </TimesheetFileUpload>
              {(isManager || isLeader || isAdmin) &&
                <>
                  <Popover placement="bottom" onClose={onClosePopoverComment}>
                    <PopoverTrigger>
                      <Button
                        className='mr-2'
                        leftIcon={<MdEditNote />}
                      >
                        {`${(!timesheetDetail?.comment || timesheetDetail?.comment === "") ? "Thêm" : "Sửa"} ghi chú`}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto">
                      <PopoverArrow />
                      <PopoverBody>
                        <FormControl className='text-[#4a5567]'>
                          <FormLabel>
                            Ghi chú
                          </FormLabel>
                          <Input
                            className='font-normal'
                            defaultValue={timesheetDetail?.comment}
                            placeholder={`Ghi chú`}
                            {...register('comment')}
                          />
                        </FormControl>
                      </PopoverBody>
                      <PopoverFooter display='flex' justifyContent='flex-end'>
                        <ButtonGroup size='sm'>
                          <Button background='primary' color='white' onClick={handleSubmit(handleComment)}>
                            OK
                          </Button>
                        </ButtonGroup>
                      </PopoverFooter>
                    </PopoverContent>
                  </Popover>
                  {timesheetDetail.proofs?.length > 0 &&
                    <Popover placement="bottom" onClose={onClosePopoverApprove}>
                      <PopoverTrigger>
                        <Button leftIcon={<MdRule />}>{`Phê duyệt tệp`}</Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto">
                        <PopoverArrow />
                        <PopoverFooter display='flex' justifyContent='flex-end'>
                          <ButtonGroup size='sm'>
                            <Button leftIcon={<MdClose />} background='primary' color='white' onClick={handleSubmit(handleDecline)}>
                              Từ chối
                            </Button>
                            <Button leftIcon={<MdCheck />} background='green.500' color='white' onClick={handleSubmit(handleApprove)}>
                              Chấp nhận
                            </Button>
                          </ButtonGroup>
                        </PopoverFooter>
                      </PopoverContent>
                    </Popover>
                  }
                </>
              }
            </div>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <div class="flex flex-col h-full -mt-3">
              <div class="flex-1 flex flex-row overflow-y-hidden">
                <nav class="order-first overflow-y-auto"
                  style={{ width: '15vw', height: '86vh' }}>
                  <Box
                    className={`relative flex items-center group min-h-[30px] cursor-default bg-[#4a5567] text-white rounded-t-lg pl-2 px-1 mr-3`}
                  >
                    <div className='my-auto mr-5'>Tệp</div>
                  </Box>
                  <div className='overflow-auto flex flex-col rounded-b-lg mr-3 px-1.5 bg-black/[.05]'
                    style={{ height: '51vh' }}>
                    {
                      timesheetDetail.proofs.map((proof) => {
                        const filenameText = (filename) => {
                          const length = 68;
                          if (filename.length > length) {
                            const start = filename.substring(0, length / 2);
                            const end = filename.substring(filename.length - length / 2);
                            return start + "..." + end;
                          } else {
                            return filename;
                          }
                        };

                        return (
                          <Box
                            className={`flex relative group min-h-[50px] cursor-pointer ${selected?._id === proof._id ? "bg-[#4a5567] text-white" : "hover:bg-black/[.1]"} mt-2 rounded-md pl-2 px-1
                                                        border-l-[6px] ${proof.isApproved ? "border-teal-500" : "border-orange-500"}`}
                            onClick={() => {
                              setSelected(proof)
                            }}>
                            {
                              <div className='absolute right-1 hidden group-hover:block top-1/2 transform -translate-y-1/2'>
                                <IconButton
                                  className='text-white'
                                  bg={'primary'}
                                  icon={<IoTrash />}
                                  onClick={async () => {
                                    const data = {
                                      timesheetId: timesheetDetail.timesheet,
                                      workDate: workDate,
                                      proofId: proof._id
                                    }
                                    await dispatch(removeFileFromTimesheet({ data, slug }));
                                  }}
                                >
                                </IconButton>
                              </div>}
                            <div className='my-auto w-full pr-3'>{filenameText(proof.proofName)}</div>
                          </Box>
                        )
                      })
                    }
                  </div>
                  <Box
                    className={`relative flex items-center group min-h-[30px] cursor-default mt-2 bg-[#4a5567] text-white rounded-t-lg mr-3 pl-2 px-1`}
                  >
                    <div className='my-auto mr-5'>Thành viên</div>
                  </Box>
                  <div className='overflow-auto flex flex-col rounded-b-lg mr-3 px-1.5 bg-black/[.05] '
                    style={{ height: '28vh' }}>
                    {
                      members.map((member) => {
                        const isEditable = isManager || isLeader || isAdmin
                        let leavers = timesheetDetail.leavers ? timesheetDetail.leavers.map((leaver) => leaver._id) : []
                        const isLeft = leavers.includes(member._id)
                        return (
                          <Popover placement='right' isOpen={isEditable ? undefined : false}>
                            <PopoverTrigger >
                              <Box
                                className={`flex relative group hover:bg-black/[.1] mt-2 ${isEditable ? "cursor-pointer" : "cursor-default"} rounded-md pl-2 px-1 border-l-[6px] ${!isLeft ? "border-teal-500" : "border-orange-500"}`}
                              >
                                {member.name}
                              </Box>
                            </PopoverTrigger>
                            <PopoverContent className='w-32'>
                              <PopoverArrow />
                              <PopoverBody>
                                <Checkbox
                                  defaultChecked={isLeft}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      leavers.push(member._id);
                                    } else {
                                      leavers = leavers.filter((leaver) => leaver !== member._id)
                                    }
                                    const data = {
                                      timesheetDetailId: timesheetDetail._id,
                                      members: leavers
                                    }
                                    dispatch(leaveMembers({ data, slug }))
                                  }}
                                >
                                  Nghỉ phép
                                </Checkbox>
                              </PopoverBody>
                            </PopoverContent>
                          </Popover>
                        )
                      })
                    }
                  </div>
                </nav>
                <main class="flex-1 overflow-y-auto">
                  {timesheetDetail.proofs?.length > 0 ?
                    <DocViewer
                      config={{
                        header: {
                          disableHeader: true,
                          disableFileName: true,
                          retainURLParams: true
                        }
                      }}
                      pluginRenderers={DocViewerRenderers}
                      documents={[
                        { uri: selected?.proofUri }
                      ]} style={{ height: '86vh' }}
                      className='mb-5 rounded-lg'
                    /> :
                    <div className="py-8 flex flex-col justify-center items-center h-full">
                      <img src={file_upload} alt="file_upload" className="w-3/12" />
                      <p className="mt-10 text-xl font-semibold">Chưa có dữ liệu</p>
                      <p className="font-sm mb-6">Bạn có thể thêm tệp tại đây.</p>
                      <TimesheetFileUpload _workDate={workDate} _shift={timesheetDetail.shift} timesheetId={timesheetDetail.timesheet} slug={slug}>
                        <Button
                          className='mr-2'
                          leftIcon={<MdInsertDriveFile />}
                        >
                          Thêm tệp
                        </Button>
                      </TimesheetFileUpload>
                    </div>
                  }
                </main>
              </div>
            </div>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
};

export default React.memo(TimesheetViewFile);
