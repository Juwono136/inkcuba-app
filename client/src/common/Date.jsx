import { FaCalendarAlt } from 'react-icons/fa'

const FormattedDate = ({ date }) => {
  const formatDate = (dateString) => {
    const dateObj = new Date(dateString)
    const options = { day: 'numeric', month: 'long', year: 'numeric' }
    return dateObj.toLocaleDateString('en-US', options)
  }

  return (
    <div className="flex items-center gap-2 text-sm text-base-content/70">
      <FaCalendarAlt className="w-4 h-4" />
      <span>{formatDate(date)}</span>
    </div>
  )
}

export default FormattedDate

