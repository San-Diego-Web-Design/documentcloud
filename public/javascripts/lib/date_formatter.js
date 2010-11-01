window.DateFormatter = {

  RFC_EXTRACTOR: /(\d{4})-(\d{1,2})-(\d{1,2})(?:T(\d{1,2}):(\d{2}):(\d{2})(?:\.\d+)?(Z|[+-](\d{2}):?(\d{2}))?)?/i,

  MONTHS: ['January', 'February', 'March', 'April', 'May', 'June', 'July',
    'August', 'September', 'October', 'November', 'December'],

  SHORT_MONTHS: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep',
    'Oct', 'Nov', 'Dec'],

  DAYS: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],

  SHORT_DAYS: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],

  AMPM: ['AM', 'PM', 'am', 'pm', 'a', 'p'],

  // Map of syntax tokens (as regexs) to code snippet that does value replacement.
  FORMATS: [
    [(/%A/g), 'DateFormatter.DAYS[d.getDay()]'],
    [(/%a/g), 'DateFormatter.SHORT_DAYS[d.getDay()]'],
    [(/%B/g), 'DateFormatter.MONTHS[d.getMonth()]'],
    [(/%b/g), 'DateFormatter.SHORT_MONTHS[d.getMonth()]'],
    [(/%d/g), 'DateFormatter.pad(d.getDate(), 2)'],
    [(/%e/g), 'd.getDate()'],
    [(/%H/g), 'DateFormatter.pad(d.getHours(), 2)'],
    [(/%I/g), 'DateFormatter.pad((d.getHours() % 12) || 12, 2)'],
    [(/%k/g), 'd.getHours()'],
    [(/%l/g), '(d.getHours() % 12) || 12'],
    [(/%M/g), 'DateFormatter.pad(d.getMinutes(), 2)'],
    [(/%m/g), 'DateFormatter.pad(d.getMonth()+1, 2)'],
    [(/%n/g), 'd.getMonth()+1'],
    [(/%P/g), 'd.getHours() < 12 ? DateFormatter.AMPM[0] : DateFormatter.AMPM[1]'],
    [(/%p/g), 'd.getHours() < 12 ? DateFormatter.AMPM[2] : DateFormatter.AMPM[3]'],
    [(/%q/g), 'd.getHours() < 12 ? DateFormatter.AMPM[4] : DateFormatter.AMPM[5]'],
    [(/%S/g), 'DateFormatter.pad(d.getSeconds(), 2)'],
    [(/%y/g), 'DateFormatter.pad(d.getFullYear() % 100, 2)'],
    [(/%Y/g), 'd.getFullYear()']
  ],

  // Create a zero-padded string of the given length.
  pad: function(number, length, radix) {
    var str = number.toString(radix || 10);
    while (str.length < length) str = '0' + str;
    return str;
  },

  // Create an (efficient) function for generating formatted date strings.
  // The following tokens are replaced in the format string:
  //
  //   %A - full weekday name (Sunday..Saturday)
  //   %a - abbreviated weekday name (Sun..Sat)
  //   %B - full month name (January..December)
  //   %b - abbreviated month name (Jan..Dec)
  //   %d - zero-padded day of month (01..31)
  //   %e - day of month (1..31)
  //   %H - zero-padded military hour (00..23)
  //   %I - zero-padded hour (01..12)
  //   %k - military hour ( 0..23)
  //   %l - hour ( 1..12)
  //   %M - minute (00..59)
  //   %m - zero-padded month (01..12)
  //   %n - month (1..12)
  //   %P - 'AM' or 'PM'
  //   %p - 'am' or 'pm'
  //   %q - 'a' or 'p'
  //   %S - second (00..59)
  //   %y - last two digits of year (00..99)
  //   %Y - year (1901...)
  //
  // For example:
  //
  //     var formatter = DateFormatter.create('%a, %b %e, %Y');
  //     var date = formatter(new Date());
  //
  create: function(f) {
    f = f.replace(/\n/g, '\\n').replace(/"/g, '\\"');
    f = 'return "' + f.replace(/"/g, '\\"') + '"';
    _.each(this.FORMATS, function(o) {
      f = f.replace(o[0], '"\n+ (' + o[1] + ') +\n"');
    });
    return new Function('d', f);
  },

  // Parse an RFC3339 date string, in any of these formats:
  //
  //  * YYYY-MM-DDThh:mm:ss-hh:mm   date, time, offset
  //  * YYYY-MM-DDThh:mm:ss         date, time  (implicit local offset)
  // *  YYYY-MM-DD                  date        (implicit midnight, local time)
  parseRfc: function(dateString) {
    var d = this.RFC_EXTRACTOR.exec(dateString);
    if (!d) throw new Error('Invalid RFC3339 Date: "' + dateString + '"');
    var h = d[4] || 0, m = d[5] || 0, s = d[6] || 0;

    // Default to local timezone, if none is specified.
    if (!d[7]) return new Date(d[1], d[2]-1, d[3], h, m, s);

    // Compensate for specified timezone.
    // Adjust for timezone
    var tzh = (d[8] || 0) * 1, tzm = (d[9] || 0) * 1;
    if (d[7].indexOf('-') >= 0) {
      tzh = -tzh;
      tzm = -tzm;
    }
    h = h * 1 - tzh;
    m = m * 1 - tzm;

    return new Date(Date.UTC(d[1], d[2]-1, d[3], h, m, s));
  }

};
