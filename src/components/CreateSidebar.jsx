import React from 'react'
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd'
import QuizCardDraggable from './QuizCardDraggable'

const CreateSidebar = ({
  cards = [],
  selectedIdx = 0,
  onSelect,
  onAddQuestion,
  onDelete,
  onCopy,
  onDragEnd
}) => {
  return (
    <aside
      className="bg-black flex flex-col justify-between items-center relative"
      style={{
        width: 300,
        position: 'fixed',
        left: 0,
        top: 56,
        height: 'calc(100vh - 56px)',
        zIndex: 40,
        boxShadow: '8px 0 24px -8px rgba(237,0,93,0.18)'
      }}
    >
      {/* Content area: danh sách quiz card có thể kéo thả */}
      <div className="flex-1 w-full overflow-y-auto no-scrollbar px-2 pt-4 pb-2">
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="quiz-cards">
            {(provided) => (
              <div ref={provided.innerRef} {...provided.droppableProps}>
                {cards.map((card, idx) => (
                  <Draggable key={card.id} draggableId={card.id.toString()} index={idx}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        className="w-full mb-2"
                        style={{
                          ...provided.draggableProps.style,
                          opacity: snapshot.isDragging ? 0.85 : 1,
                          background: selectedIdx === idx ? '#ED005D40' : 'transparent',
                          borderRadius: 12,
                          cursor: 'pointer',
                        }}
                        onMouseDown={e => {
                          if (e.button === 0 && onSelect) onSelect(idx)
                        }}
                      >
                        <QuizCardDraggable
                          index={idx + 1}
                          onDelete={() => onDelete && onDelete(idx)}
                          onCopy={() => onCopy && onCopy(idx)}
                          imageSrc={card.imageSrc}
                          frameSrc={card.frameSrc}
                          infoText={card.infoText}
                        />
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </div>
      {/* Bottom button luôn nằm giữa và gần phía dưới */}
      <div className="w-full flex justify-center mb-16">
        <button
          className="flex items-center justify-center space-x-2 bg-pink-600 hover:bg-pink-700 focus:ring-4 focus:ring-pink-400 focus:outline-none rounded-full py-3 px-6 text-white font-medium text-base shadow-lg transition"
          type="button"
          aria-label="Thêm câu hỏi"
          onClick={onAddQuestion}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          <span>Thêm câu hỏi</span>
        </button>
      </div>
    </aside>
  )
}

export default CreateSidebar 